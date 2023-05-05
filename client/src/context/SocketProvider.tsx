import React, {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useContext,
  useRef,
} from 'react'
import { Socket, io } from 'socket.io-client'
import Peer from 'simple-peer'

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
}

// Create a new context for the socket
export const SocketContext = createContext<SocketContextValue>({
  socket: null,
  myVideo: {} as React.RefObject<HTMLVideoElement>,
  userVideo: {} as React.RefObject<HTMLVideoElement>,
  callUser: (value: string) => console.log('callUser not implemented'),
})

// Create a SocketProvider component
const socket = io('localhost:3000')
export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [userId, setUserId] = useState<string | null>(null)
  const [call, setCall] = useState<any>({})
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraOn, setCameraOn] = useState(true)
  const [name, setName] = useState<string>('fisi')
  const [callAccepted, setCallAccepted] = useState<boolean>(false)

  const myVideo = useRef<HTMLVideoElement>(null)
  const userVideo = useRef<HTMLVideoElement>(null)
  const connectionRef = useRef<Peer.Instance | null>(null)

  useEffect(() => {
    socket.on('connection', () => {
      console.log('Connected to server')
    })

    socket.on('me', (id: string) => {
      console.log(id)
      setUserId(id)
    })

    socket.on('callUser', ({ from, name: callerName, signal }) => {
      setCall({ isReceivingCall: true, from, name: callerName, signal })
    })

    return () => {
      console.log('Disconnecting socket')
      socket.emit('ends')
    }
  }, [])

  useEffect(() => {
    if (cameraOn) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setStream(stream)
          if (myVideo.current) {
            myVideo.current.srcObject = stream
          }
        })
        .catch((error) => {
          console.error('Error getting user media:', error)
        })
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop()
        })
      }
      setStream(null)
    }
  }, [cameraOn])

  const toggleCamera = () => {
    if (cameraOn) {
      // turn off camera
      setCameraOn(false)
    } else {
      // turn on camera
      setCameraOn(true)
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
      console.log(connectionRef.current)
    }
  }

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
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}
