import { SocketContext } from './context/SocketProvider'
import { useContext, useRef, useState } from 'react'
import {
  FaCopy,
  FaPhoneSlash,
  FaPhone,
  FaCaretRight,
  FaCaretLeft,
} from 'react-icons/fa'
import { BsCameraVideoFill, BsCameraVideoOffFill } from 'react-icons/bs'

const Room = () => {
  const [copyText, setCopyText] = useState('')
  const [show, setShow] = useState(false)
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
    cameraOn,
  } = useContext(SocketContext)

  const copyToClipboard = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault()
    if (userId) {
      navigator.clipboard.writeText(userId)
    }
  }
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName?.(e.target.value)
  }

  const toggleForm = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    setShow(!show)
  }
  return (
    <div className="video-call-wrapper">
      <div className="camera-wrapper">
        <div className="primary-video">
          <video className="video" ref={myVideo} autoPlay muted />
        </div>
        {callAccepted && !callEnd && (
          <div className="secondary-video">
            <video className="video" ref={userVideo} autoPlay muted />
          </div>
        )}
      </div>

      <div className="options">
        {call && !call.isReceivingCall && !callAccepted && (
          <form>
            {show ? (
              <>
                <button onClick={copyToClipboard} className="copy-btn">
                  <FaCopy />
                </button>
                <input
                  type="text"
                  placeholder="Enter name..."
                  onChange={onChange}
                />
                <input
                  type="text"
                  placeholder="Enter call Id"
                  onChange={(e) => setCopyText(e.target.value)}
                />
                <button onClick={toggleForm}>
                  <FaCaretLeft size={25} />
                </button>
              </>
            ) : (
              <button className="toggleForm" onClick={toggleForm}>
                <FaCaretRight size={25} />
              </button>
            )}
          </form>
        )}
        <button onClick={toggleCamera} className="toggleCamera">
          {cameraOn ? <BsCameraVideoFill /> : <BsCameraVideoOffFill />}
        </button>
        {callAccepted && (
          <button onClick={leaveCall} className="end">
            <FaPhoneSlash />
          </button>
        )}

        {call && !call.isReceivingCall && !callAccepted && (
          <button
            onClick={() => {
              if (copyText.length > 5) {
                callUser(copyText)
                setShow(false)
              }
            }}
            className="call"
          >
            <FaPhone />
          </button>
        )}
        {call.isReceivingCall && !callAccepted && (
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <h1>{call.name ? call.name : 'User'} is calling:</h1>
            <button onClick={answerCall} className="call">
              <FaPhone />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Room
