const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['POST', 'GET'],
  },
})

app.use(cors())

app.get('/', (req, res) => {
  console.log('app is running ')
})

io.on('connection', (socket) => {
  socket.emit('me', socket.id)

  socket.on('disconnect', () => {
    socket.broadcast.emit('callEnded', socket.id)
  })

  socket.on('callUser', ({ userToCall, signal, from, name }) => {
    io.to(userToCall).emit('callUser', { signal, from, name })
  })

  socket.on('answerCall', (data) => {
    io.to(data.to).emit('callAccepted', data.signal)
  })
})

server.listen(3000, () => {
  console.log('Server running on port 3000')
})
