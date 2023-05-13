import { SocketContext } from './context/SocketProvider'
import { useContext, useRef, useState } from 'react'

const Room = () => {
  const [copyText, setCopyText] = useState('')
  const {
    callAccepted,
    myVideo,
    userVideo,
    toggleCamera,
    callUser,
    userId,
    answerCall,
    call,
    setName,
    callEnd,
    leaveCall,
  } = useContext(SocketContext)

  const copyToClipboard = () => {
    if (userId) {
      navigator.clipboard.writeText(userId)
    }
  }
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName?.(e.target.value)
  }
  return (
    <div>
      <p>{userId}</p>
      <div>
        <button onClick={copyToClipboard}>copy to clipboard</button>
        <input type="text" placeholder="Enter name..." onChange={onChange} />
        <input
          type="text"
          placeholder="Enter call Id"
          onChange={(e) => setCopyText(e.target.value)}
        />
      </div>
      <video ref={myVideo} autoPlay muted />

      <button onClick={toggleCamera}>toggle camera</button>
      <button onClick={leaveCall}>leave call</button>
      {callAccepted && !callEnd && (
        <div style={{ width: '300px', height: '300px' }}>
          <video ref={userVideo} autoPlay muted />
        </div>
      )}

      <button onClick={() => callUser(copyText)}>call</button>
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
