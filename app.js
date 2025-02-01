const express = require('express');
const session = require('express-session');
require('dotenv').config();

const conn = require('./config/db');
const socketio = require('socket.io');
const { createServer } = require('http');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');
const axios = require('axios')
const path = require('path');


const userModel = require('./models/user-model');
const roomModel = require('./models/room-model');
const routes = require('./routes/routes');
const apis = require('./routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

const server = createServer(app);
const io = socketio(server, {
    transports: ['websocket'],
    pingInterval: 10000,
    pingTimeout: 5000,
});

io.on("connection", (socket) => {
    socket.on('join-room', async ({ roomId, userId }) => {
        const room = io.sockets.adapter.rooms.get(roomId) || new Set();

        if (room.size == 0) {
            socket.join(roomId);
            socket.emit('player-joined', { roomId, player: 'X' });

            const user = await userModel.findOne({ _id: userId });

            io.to(roomId).emit('load-waiting-window', user);
            io.emit('room-created', { roomId, user });

            const newRoom = await roomModel.create({ roomId: roomId, username: user.username, userid: user._id, userPic: user.profilePic.replace('./public', '') });
        } else if (room.size == 1) {
            socket.join(roomId);
            socket.emit('player-joined', { roomId, player: 'O' });
            io.to(roomId).emit('start-game', { roomId });

            const user = await userModel.findOne({ _id: userId });

            io.to(roomId).emit('load-game-board', user);
            io.emit('room-full', { roomId });

            await roomModel.findOneAndDelete({ roomId });
        }

    })

    socket.on('req-sync-profile-pic', ({ roomId, xPlayer, oPlayer, username }) => {

        io.to(roomId).emit('sync-profile-pic', { xPlayer, oPlayer, username });
    })

    socket.on('send-message', ({ roomId, messageText }) => {

        socket.to(roomId).emit('got-message', messageText)
    })

    socket.on('send-sticker', ({ roomId, sticker }) => {

        socket.to(roomId).emit('got-sticker', sticker)
    })

    socket.on('player-click', ({ index, roomId, player }) => {

        io.to(roomId).emit('make-changes', { index, player });
    })
    
    socket.on('increase-pts', async ({roomId, userId})=>{
        await userModel.findOneAndUpdate({ _id: userId }, { $inc: { coins: 2 } });
    });

    socket.on('dicrease-pts', async ({roomId, userId})=>{
        await userModel.findOneAndUpdate({ _id: userId }, { $inc: { coins: -1 } });
    });

    socket.on('next-turn', ({ nextTurn, roomId }) => {
        io.to(roomId).emit('set-turn', { nextTurn });
    })

    socket.on('player-won', async ({ playerWon, currentPlayer, roomId, userId }) => {


        if (playerWon == currentPlayer) await userModel.findOneAndUpdate({ _id: userId }, { $inc: { coins: 2 } });
        else await userModel.findOneAndUpdate({ _id: userId }, { $inc: { coins: -1 } });
        io.to(roomId).emit('game-over', { playerWon });
    })

    socket.on('draw', ({ roomId }) => {
        io.to(roomId).emit('game-draw');
    })

    socket.on("destroy-room", async (roomId) => {
        const room = io.sockets.adapter.rooms.get(roomId);

        if (room) {

            io.emit('room-full', { roomId });

            await roomModel.findOneAndDelete({ roomId });

            room.forEach((socketId) => {
                const memberSocket = io.sockets.sockets.get(socketId);
                if (memberSocket) {
                    memberSocket.leave(roomId);
                }
            });
        }
    });

    socket.on('page-refreshed', ()=>{
        const rooms = [...socket.rooms].filter(room => room !== socket.id);

        rooms.forEach((room) => {
            const roomData = io.sockets.adapter.rooms.get(room);
            
            io.to(room).emit('player-disconnected', { socketId: socket.id, roomsLen: roomData.length });
        })
    })

    socket.on('disconnecting', () => {

        const rooms = [...socket.rooms].filter(room => room !== socket.id);

        rooms.forEach((room) => {
            const roomData = io.sockets.adapter.rooms.get(room);
            
            io.to(room).emit('player-disconnected', { socketId: socket.id, roomsLen: roomData.length });
        })
    });
});

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(flash())

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 9000000000000 },
}))

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const regExpUsername = new RegExp(`^${username}$`, 'i');

        const user = await userModel.findOne({ username: regExpUsername });

        if (!user) {
            return done(null, false, { message: "Incorrect Username or Password" });
        }

        if (!user.password) {
            return done(null, false, { message: "Login with Google" })
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {

            if (err) return done(err);

            if (!isMatch) return done(null, false, { message: "Incorrect Username or Password" });

            return done(null, user);
        })
    } catch (error) {
        console.log(error)
    }
}));

passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },

    async (accessToken, refreshToken, profile, done) => {

        try {

            const user = await userModel.findOneAndUpdate({ profileId: profile.id }, {
                name: profile.displayName,
                email: profile.emails[0].value,
                username: profile.emails[0].value.split('@')[0],
            }, { new: true, upsert: true });

            done(null, user)
        } catch (error) {
            done(error, false)
        }
    }
))

passport.serializeUser((user, done) => {
    
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {

    const user = await userModel.findOne({ _id: id });

    done(null, user);
})

app.use('/', routes);
app.use('/', apis);

setInterval(async ()=>{
    try {
        const response = await axios.get('https://tictactoe-q4q1.onrender.com/');
    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
}, 300000);

server.listen(PORT, () => { console.log(`Running at http://localhost:3000`) });