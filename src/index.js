const path= require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const port = process.env.PORT || 3000
const app = express()
const server = http.createServer(app)
const io= socketio(server) //server supports web sockets

const publicDirectoryPath= path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

let count = 0

//server(emit)-> client(receive)-countUpdated
//client(emit)->server(receive)- increment

io.on('connection' ,(socket)=>{ //socket is an object and it contains information about that new connection
    console.log('New WebSocket Connection')

    socket.emit('countUpdated', count)

    socket.on('increment',()=>{
        count++
        //socket.emit('countUpdated', count) //didnot change count in real time on two tab
        io.emit('countUpdated', count)

    })
})

server.listen(port, ()=>{
    console.log('Server is up on port ' +port)
})