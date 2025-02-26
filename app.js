const express = require('express');
const session = require('express-session');
require('dotenv').config();

const conn = require('./config/db');
const { createServer } = require('http');
const morganLogger = require('./middlewares/loggerMiddleware');
const passport = require('passport');
const flash = require('connect-flash');
const axios = require('axios')
const path = require('path');
require('./config/passportjs-config')(passport);

// Require Routes
const pageRoutes = require('./routes/pageRoutes');
const userRoutes = require('./routes/userRoutes')
const apiRoutes = require('./routes/apiRoutes');
const { logError, logDebug } = require('./Services/loggerService');
const socketHandler = require('./socket/socketHandler');

const app = express();
const PORT = process.env.PORT || 3000;

const server = createServer(app);
socketHandler(server);

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(flash());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 9000000000000 },
}));

app.use(morganLogger);
app.use(passport.initialize());
app.use(passport.session());

// Routes Middleware
app.use('/', pageRoutes);
app.use('/', userRoutes)
app.use('/', apiRoutes);

// Rendering 404 page if no route match
app.all('*', (req, res) => {
    const user = req.isAuthenticated() ? req.user : null;
    res.status(404).render('404', { user });
});

// IGNORE IT: Just to keep renderer ON
setInterval(async () => {
    try {
        const response = await axios.get('https://tictactoe-q4q1.onrender.com/');
    } catch (error) {
        logError(error)
    }
}, 300000);

server.listen(PORT, () => { logDebug(`Running at http://localhost:${PORT}`) });