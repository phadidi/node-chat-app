const socket = io()

// Elements
const $sendMessageForm = document.querySelector('#sendMessage-form')
const $sendMessageInput = $sendMessageForm.querySelector('input')
const $sendMessageButton = $sendMessageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#sendLocation-button')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, chatroom } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    
    const visibleHeight = $messages.offsetHeight
    const containerHeight = $messages.scrollHeight
    const scrollOffset = $messages.scrollTop + visibleHeight
    if (containerHeight - newMessageHeight <= scrollOffset)
        $messages.scrollTop = $messages.scrollHeight
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('YYYY-MM-DD h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (location) => {
    console.log(location)
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        url: location.url,
        createdAt: moment(location.createdAt).format('YYYY-MM-DD h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('chatroomData', ({ chatroom, users }) => {
    console.log(chatroom)
    console.log(users)
    const html = Mustache.render(sidebarTemplate, {
        chatroom, users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$sendMessageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    // disable until message is sent
    $sendMessageButton.setAttribute('disabled', 'disabled')
    const message = e.target.elements.msg.value
    socket.emit('sendMessage', message, (status) => {
        // enable after message is sent
        $sendMessageButton.removeAttribute('disabled')
        $sendMessageInput.value = ''
        $sendMessageInput.focus()
        if (status)
            return console.log(status)
        console.log('No special status received')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation not supported by this browser.')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        $sendLocationButton.removeAttribute('disabled')
        socket.emit('sendLocation', {latitude: position.coords.latitude, longitude: position.coords.longitude}, () => {
            console.log('Location coordinates sent')
        })
    })    
})

socket.emit('join', { username, chatroom }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})