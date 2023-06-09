import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 } from 'uuid'
import { SocketContext } from './context/SocketProvider'

const Home = () => {
  const { setId, setIsLoggedIn } = useContext(SocketContext)
  const navigate = useNavigate()
  const loginHandler = () => {
    const id = v4()
    setId(id)
    setIsLoggedIn('true')
    localStorage.setItem('loggedIn', 'true')

    navigate(`/room/${id}`)
  }
  return (
    <div className="container">
      <h2>Video Call App</h2>
      <button className="login-btn" onClick={loginHandler}>
        Login
      </button>
    </div>
  )
}

export default Home
