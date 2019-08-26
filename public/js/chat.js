//CLIENT Side Javascript

const socket= io() // to connect to the server  

//Elements
const $messageForm= document.querySelector('#message-form')
const $messageFormInput= $messageForm.querySelector('input')
const $messageFormButton= $messageForm.querySelector('button')
const $sendLocationButton= document.querySelector('#send-location')
const $messages= document.querySelector('#messages') //location where we have to render the template

//Templates
const messageTemplate= document.querySelector('#message-template').innerHTML
const locationMessageTemplate= document.querySelector('#location-message-template').innerHTML

//Options
const {username, room}= Qs.parse(location.search, {ignoreQueryPrefix: true})

//clinet side FOR MESSAGE
socket.on('message', (message)=>{
    console.log(message) //for seeing what we are getting

    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
})

//client side FOR LOCATION
socket.on('locationMessage', (message)=>{
    console.log(message) //for seeing what we are getting

    const html= Mustache.render(locationMessageTemplate, {
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')         
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()

$messageFormButton.setAttribute('disabled', 'disabled')
//disable send button

const message = e.target.elements.message.value

socket.emit('sendMessage',message, (error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value= ''
        $messageFormInput.focus()

        //enable 
        if(error){
            return console.log(error)
        }
        console.log('Message Delivered!')
    })
})

$sendLocationButton.addEventListener('click', ()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')
    //disable location button

    navigator.geolocation.getCurrentPosition((position)=>{
        //console.log(position)

        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude: position.coords.longitude
        }, ()=>{
            //enable location button
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
})

socket.emit('join', {username, room},(error)=>{
    if(error){
        alert(error)
        location.href= '/'
    }
})

