import React, { useState, useEffect, useRef } from 'react'
import { useSocket } from './context/SocketProvider'

const App = () => {
  const { socket, userId } = useSocket()

  return <div>{userId}</div>
}

export default App
