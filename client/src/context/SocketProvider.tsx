import React, {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useContext,
  useRef,
} from 'react'
import { Socket, connect, io } from 'socket.io-client'
import Peer from 'simple-peer'
import { useLocation, useNavigate } from 'react-router-dom'

// Define the type for the props
type SocketProviderProps = {
  children: ReactNode
}

// Define the type for the context value
type SocketContextValue = {
  socket: Socket | null
  userId?: string | null
  myVideo: React.RefObject<HTMLVideoElement>
  userVideo: React.RefObject<HTMLVideoElement>
  toggleCamera?: () => void
  callUser: (id: string) => void
  answerCall?: () => void
  callAccepted?: boolean
  name?: string
  setCallAccepted?: (value: boolean) => void
  setName?: (value: string) => void
  stream?: MediaStream | null
  setStream?: (value: MediaStream | null) => void
  call?: any
  cameraOn?: boolean
  setId: (value: string) => void
  setIsLoggedIn: (value: string) => void
  callEnd?: boolean
  leaveCall?: () => void
  declineCall?: () => void
}

// Create a new context for the socket
export const SocketContext = createContext<SocketContextValue>({
  socket: null,
  myVideo: {} as React.RefObject<HTMLVideoElement>,
  userVideo: {} as React.RefObject<HTMLVideoElement>,
  callUser: () => console.log('callUser not implemented'),
  setId: () => console.log('setId not implemented'),
  setIsLoggedIn: () => console.log('setIsLoggedIn not implemented'),
})

// Create a SocketProvider component
const socket = io('localhost:3000')
export const SocketProvider = ({ children }: SocketProviderProps) => {
  const location = useLocation()
  const locationId = location.pathname.split('/')[2]
  const navigate = useNavigate()
  const [userId, setUserId] = useState<string | null>(null)
  const [call, setCall] = useState<any>({})
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraOn, setCameraOn] = useState(true)
  const [name, setName] = useState<string>('')
  const [callAccepted, setCallAccepted] = useState<boolean>(false)
  const [id, setId] = useState<string | null>(locationId)
  const [callEnd, setCallEnd] = useState(false)

  const loginVal = localStorage.getItem('loggedIn')
  const isLogged =
    typeof loginVal === 'string' && loginVal === 'true' ? 'true' : 'false'

  const [isLoggedIn, setIsLoggedIn] = useState(isLogged)

  const myVideo = useRef<HTMLVideoElement>(null)
  const userVideo = useRef<HTMLVideoElement>(null)
  const connectionRef = useRef<Peer.Instance | null>(null)

  useEffect(() => {
    let currentStream: MediaStream | null = null
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })
        currentStream = stream
        setStream(stream)
        if (myVideo.current) {
          myVideo.current.srcObject = stream
        }
      } catch (err) {
        console.error(err)
      }
    }
    if (isLoggedIn === 'true') {
      if (location.pathname.startsWith('/room/') && locationId === id) {
        getMedia()
      } else {
        setIsLoggedIn('false')
        localStorage.setItem('loggedIn', 'false')
      }
    } else {
      navigate('/')
    }

    socket.on('me', (id) => {
      localStorage.setItem('socketId', id)
      setUserId(id)
    })

    socket.on('callUser', ({ from, name: callerName, signal }) => {
      setCall({ isReceivingCall: true, from, name: callerName, signal })
    })

    return () => {
      localStorage.removeItem('socketId')
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [isLoggedIn, location.pathname, locationId, id, navigate, call])

  useEffect(() => {
    if (callAccepted) {
      socket.on('callEnded', () => {
        console.log('callEnded')
        setCallEnd(true)
        setCall({})
        setStream(null)
        setCallAccepted(false)
        setCallEnd(false)
        if (connectionRef.current || Object.keys(call).length === 0) {
          connectionRef.current?.destroy()
        }
      })
    }
  }, [callAccepted, call])
  const toggleCamera = () => {
    if (stream) {
      const tracks = stream.getTracks()
      const videoTrack = tracks.find((track) => track.kind === 'video')
      if (videoTrack) {
        // toggle camera
        videoTrack.enabled = !videoTrack.enabled
        setCameraOn(videoTrack.enabled)
      }
    }
  }

  const answerCall = () => {
    if (stream && call && call.signal) {
      setCallAccepted(true)

      const peer = new Peer({ initiator: false, trickle: false, stream })

      peer.on('signal', (data) => {
        socket.emit('answerCall', { signal: data, to: call.from })
      })

      peer.on('stream', (currentStream) => {
        if (userVideo.current) {
          userVideo.current.srcObject = currentStream
        }
      })

      peer.signal(call.signal)

      connectionRef.current = peer
    }
  }

  const callUser = (id: string) => {
    if (stream) {
      const peer = new Peer({ initiator: true, trickle: false, stream })
      peer.on('signal', (data) => {
        socket.emit('callUser', {
          userToCall: id,
          signal: data,
          from: userId,
          name,
        })
      })

      peer.on('stream', (currentStream) => {
        if (userVideo.current) {
          userVideo.current.srcObject = currentStream
        }
      })

      socket.on('callAccepted', (signal) => {
        setCallAccepted(true)

        peer.signal(signal)
      })

      connectionRef.current = peer
    }
  }

  function leaveCall() {
    setCallEnd(true)
    setCall({})
    setStream(null)
    setCallAccepted(false)
    setCallEnd(false)
    if (connectionRef.current || Object.keys(call).length === 0) {
      connectionRef.current?.destroy()
    }
    window.location.reload()
  }

  function declineCall() {
    setCall({})
    if (connectionRef.current) {
      connectionRef.current.destroy()
    }
    window.location.reload()
  }

  window.addEventListener('popstate', () => {
    setIsLoggedIn('false')
    localStorage.setItem('loggedIn', 'false')
  })

  return (
    <SocketContext.Provider
      value={{
        socket,
        userId,
        myVideo,
        userVideo,
        name,
        setName,
        toggleCamera,
        callUser,
        answerCall,
        stream,
        callAccepted,
        call,
        cameraOn,
        setId,
        setIsLoggedIn,
        callEnd,
        leaveCall,
        declineCall,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}
