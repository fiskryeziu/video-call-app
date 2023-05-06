import { SocketContext } from './context/SocketProvider'
import { useContext } from 'react'

const Room = () => {
  const {
    callAccepted,
    myVideo,
    userVideo,
    toggleCamera,
    callUser,
    userId,
    answerCall,
    call,
  } = useContext(SocketContext)
  console.log(call)
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

      <button onClick={() => callUser('p37fF6Fv8t6je70FAAAF')}>call</button>
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

export default Room
