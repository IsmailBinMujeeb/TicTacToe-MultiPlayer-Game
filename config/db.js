const mongoose = require('mongoose');

module.exports = mongoose.connect('mongodb://localhost:27017/TICTACTOI')
.then(() => { console.log('Connected To Database') })
.catch(e=>console.log(e));