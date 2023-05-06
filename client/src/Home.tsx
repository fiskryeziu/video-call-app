import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 } from 'uuid'
import { SocketContext } from './context/SocketProvider'

const Home = () => {
  const navigate = useNavigate()
  const loginHandler = () => {
    navigate(`/room/${v4()}`)
  }
  return (
    <div>
      Home
      <button onClick={loginHandler}>Login</button>
    </div>
  )
}

export default Home
