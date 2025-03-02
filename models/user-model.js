const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { logError } = require('../Services/loggerService');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, 'name is required field in user model.'],
    },

    email: {
        type: String,
        require: [true, 'email is required field in user model.'],
        unique: [true, 'email must be unique in user model.'],
        validate: {
            validator: function (email){
                return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
            },

            message: props => `${props.value} is not a valid email.`, 
        },
    },

    password: {
        type: String,
        sparse: true,
        select: false,
    },

    username: {
        type: String,
        require: [true, 'username field is require in user model.'],
        unique: [true, 'username field must be unique in user model.'],
        validate: {
            validator: function (username){
                return /^[a-zA-Z0-9._-]{3,16}$/.test(username);
            },

            message: props => `${props.value} is not a validate username`
        }
    },

    profilePic: {
        type: String,
        default:
            'http://res.cloudinary.com/dpjpkfwhw/image/upload/v1740503975/s6lutrulcbp7ksiuzplw.png',
    },

    profileId: {
        type: String,
        sparse: true,
        select: false,
        unique: [true, `profile id field must be unique in user model.`],
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
