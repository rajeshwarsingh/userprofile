require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();

const routes = require('./routes/routes');

app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

app.use('/', routes);

app.use(function(req, res, next) {
    res.status(404).send('404 page');
});

//Connect to db credentials inside .env file
mongoose.connect(process.env.MONGO_URL);

// unhandledRejection handed here include error in async block
process.on('unhandledRejection', error => {
    // Prints "unhandledRejection woops!"
    console.log('unhandledRejection', error)
});

module.exports = app;
