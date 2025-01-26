const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({

    roomId: {
        type: String,
    }, 

    username: {
        type: String,
    },

    userid: {
        type: String,
    },

    userPic: {
        type: String,
        default: 'https://static.vecteezy.com/system/resources/previews/009/734/564/original/default-avatar-profile-icon-of-social-media-user-vector.jpg'
    }
})

module.exports = mongoose.model('room', roomSchema);