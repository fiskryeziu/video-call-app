const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')

const app = express()
const server = http.createServer(app)
const io = socketIo(server)

app.use(
  cors({
    origin: 'http://localhost:5173',
  })
)

io.on('connection', (socket) => {
  console.log('A user has connected')
  socket.on('disconnect', () => {
    console.log('A user has disconnected')
  })

  socket.on('chat message', (msg) => {
    console.log('Message' + msg)
    io.emit('chat message', msg)
  })
})

server.listen(3000, () => {
  console.log('Server listening on port 3000')
})
