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
        default: '/images/profile.png'
    },

    profileId:{
        type: String,
    },

    coins: {
        type: Number,
        default: 10,
    }
})

module.exports = mongoose.model('user', userSchema);