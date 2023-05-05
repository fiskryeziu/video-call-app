import { SocketContext } from './context/SocketProvider'
import { useContext } from 'react'

const App = () => {
  const {
    name,
    callAccepted,
    myVideo,
    userVideo,
    toggleCamera,
    stream,
    callUser,
    userId,
    answerCall,
    call,
  } = useContext(SocketContext)

  return (
    <div>
      <p>{userId}</p>
      <video ref={myVideo} autoPlay muted />

      <button onClick={toggleCamera}>toggle camera</button>
      {callAccepted && (
        <div style={{ width: '300px', height: '300px' }}>
          <video ref={userVideo} autoPlay muted />
        </div>
      )}

      <button onClick={() => callUser(`${userId && userId}`)}>call </button>

      {call.isReceivingCall && !callAccepted && (
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <h1>{call.name} is calling:</h1>
          <button color="primary" onClick={answerCall}>
            Answer
          </button>
        </div>
      )}
    </div>
  )
}

export default App
