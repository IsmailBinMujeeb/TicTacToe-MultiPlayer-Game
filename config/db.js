const mongoose = require('mongoose');

module.exports = mongoose.connect(process.env.DB_CONN_STR)
.then(() => { console.log('Connected To Database') })
.catch(e=>console.log(e));