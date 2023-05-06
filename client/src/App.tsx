import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { SocketProvider } from './context/SocketProvider.jsx'
import Room from './Room'
import Home from './Home'

const App = () => {
  return (
    <Router>
      <SocketProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:id" element={<Room />} />
        </Routes>
      </SocketProvider>
    </Router>
  )
}

export default App
