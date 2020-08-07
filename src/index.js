const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInChatroom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

// server (emit) -> client (receive) --acknowledgement--> server
// client (emit) -> server (receive) --acknowledgement--> client

io.on('connection', (socket) => {
    console.log('New WebSocket connection')
    socket.on('join', (options, callback) => {
        const { error, user } = addUser(({id: socket.id, ...options }))
        if (error)
            return callback(error)

        socket.join(user.chatroom)
        socket.emit('message', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.chatroom).emit('message', generateMessage('Admin', `${user.username} has joined the chat.`))
        io.to(user.chatroom).emit('chatroomData', {
            chatroom: user.chatroom,
            users: getUsersInChatroom(user.chatroom)
        })
        callback()
    })
    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        if (filter.isProfane(message))
            return callback('No swearing')
        const user = getUser(socket.id)
        io.to(user.chatroom).emit('message', generateMessage(user.username, message))
        callback('New message delivered')
    })
    socket.on('sendLocation', (location, callback) => {
        const locationURL = `https://google.com/maps?q=${location.latitude},${location.longitude}`
        const user = getUser(socket.id)
        io.to(user.chatroom).emit('locationMessage', generateLocationMessage(user.username, locationURL))
        callback()
    })
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.chatroom).emit('message', generateMessage('Admin', `${user.username} has logged off.`))
            io.to(user.chatroom).emit('chatroomData', {
                chatroom: user.chatroom,
                users: getUsersInChatroom(user.chatroom)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})