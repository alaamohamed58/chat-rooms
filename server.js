const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const formatMessage = require("./utils/messages")
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require("./utils/users")



const PORT = 3000 || process.env.PORT

const app = express()

const server = http.createServer(app);

const io = socketio(server)
// Set static folder
app.use(express.static(path.join(__dirname, "public")))


// Run when a client connects
const botName = 'ChatCord'
io.on('connection', (socket) => {

    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room)

        socket.join(user.room)

        //Welcome the user
        socket.emit('message', formatMessage(botName, 'Welcome to ChatCord'))

        //Broadcast when a user connects
        // All the clients except the client that is connected
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`))


    })




    //Listen for chatMsg
    socket.on("chatMsg", (msg) => {
        const user = getCurrentUser(socket.id)



        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })

    //Runs when the client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)
        if (user) {
            io.to(user.room).emit("message", formatMessage(botName, `${user.username} has left the chat`))

        }

    })


})



server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})