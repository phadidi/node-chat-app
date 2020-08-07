const users = []

// addUser, removeUser, getUser, getUsersInChatroom

const addUser = ({ id, username, chatroom }) => {
    // Clean the data
    username = username.trim().toLowerCase()
    chatroom = chatroom.trim().toLowerCase()

    if (!username || !chatroom) {
        return { error: 'No username and/or chatroom provided.' }
    }

    const existingUser = users.find((user) => {
        return user.chatroom === chatroom && user.username === username
    })

    if (existingUser) {
        return { error: 'That username already exists in this chatroom' }
    }

    const user = { id, username, chatroom }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })
    if (index !== -1)
        return users.splice(index, 1)[0]
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInChatroom = (chatroom) => {
    // Make sure formatting is consistent before search
    chatroom = chatroom.trim().toLowerCase()
    return users.filter((user) => user.chatroom === chatroom)
}

module.exports = {
    addUser, removeUser, getUser, getUsersInChatroom
}