//CLIENT Side Javascript

const socket= io() // to connect to the server  

socket.on('countUpdated', (count)=>{
    console.log('The count has been updated!', count)
})

document.querySelector('#increment').addEventListener('click',()=>{
    console.log('Clicked')
    socket.emit('increment')
})