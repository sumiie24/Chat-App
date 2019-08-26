const path= require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {  generateMessage, generateLocationMessage }= require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom  } = require('./utils/users')

const port = process.env.PORT || 3000
const app = express()
const server = http.createServer(app)
const io= socketio(server) //server supports web sockets

const publicDirectoryPath= path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

//server(emit)-> client(receive)-countUpdated
//client(emit)->server(receive)- increment

io.on('connection' ,(socket)=>{ //socket is an object and it contains information about that new connection
    console.log('New WebSocket Connection')

    socket.on('join', (options, callback)=>{

        const { error, user } = addUser ({ id : socket.id, ...options})

        if(error){
            return callback(error)
        }

        socket.join(user.room) //join the room

        socket.emit('message', generateMessage('Welcome!')) // someone joining and sending welcome message for every new connection
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`)) // emit to room

        //socket.emit, io.emit, socket.broadcast.emit
        // io.to.emit, socket.broadcast.to.emit 
    })
    
    //for message
    socket.on('sendMessage',(message, callback) => {
        const filter = new Filter()

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }

        io.to('webroom').emit('message', generateMessage(message)) //now sending to every connected client
        callback()    
    })

    //for location
    socket.on('sendLocation', (coords, callback)=>{
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    }) 

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMessage(`${user.username} has left!`))
        }
    })
})

server.listen(port, ()=>{
    console.log('Server is up on port ' +port)
})