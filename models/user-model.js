const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { logError } = require('../Services/loggerService');

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
        default:
            'http://res.cloudinary.com/dpjpkfwhw/image/upload/v1740503975/s6lutrulcbp7ksiuzplw.png',
    },

    profileId: {
        type: String,
    },

    coins: {
        type: Number,
        default: 10,
    },
});

userSchema.pre('save', async function (next) {

    try {
        if (!this.isModified("password")) return next();

        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        logError(error)
    }
})

module.exports = mongoose.model('user', userSchema);
