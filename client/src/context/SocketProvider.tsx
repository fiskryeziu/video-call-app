import React, {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
  useContext,
} from 'react'
import { Socket, io } from 'socket.io-client'

// Define the type for the props
type SocketProviderProps = {
  children: ReactNode
}

// Define the type for the context value
type SocketContextValue = {
  socket: Socket | null
  userId?: string | null
}

// Create a new context for the socket
export const SocketContext = createContext<SocketContextValue>({
  socket: null,
})

export const useSocket = () => {
  const socket = useContext(SocketContext)
  return socket
}

// Create a SocketProvider component
export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [userId, setUserId] = useState<string | null>(null)
  const [call, setCall] = useState({})
  const socket = useMemo(() => {
    const socket = io('http://localhost:3000')

    socket.on('me', (id: string) => {
      setUserId(id)
    })

    socket.on('calluser', ({ signal, from, caller }) => {
      setCall({ isReceivingCall: true, from, name: caller, signal })
    })

    return socket
  }, [])

  // Connect to the socket when the component mounts
  return (
    <SocketContext.Provider value={{ socket, userId }}>
      {children}
    </SocketContext.Provider>
  )
}
