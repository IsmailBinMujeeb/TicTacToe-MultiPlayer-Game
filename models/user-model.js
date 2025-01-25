const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    name: {
        type: String,
    }, 

    email: {
        type: String,
    },

    password: {
        type: String,
    },

    username: {
        type: String,
        unique: true,
    },

    profilePic: {
        type: String,
        default: 'https://static.vecteezy.com/system/resources/previews/009/734/564/original/default-avatar-profile-icon-of-social-media-user-vector.jpg'
    }
})

module.exports = mongoose.model('user', userSchema);