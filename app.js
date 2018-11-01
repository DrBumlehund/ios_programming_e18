const express = require('express');
const app = express();
const server = require('http').createServer(app);
const bodyParser = require('body-parser');
const db = require('./src/db.js');


const port = process.env.port || 9988;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/score', (req, res) => {
    db.save_score(req.body)
    .catch((reason) =>{
        res.statusCode = 400
        res.send(reason)
    })
    .then((result) => {
        res.send(result);
    });
});

app.get('/score', (req, res) => {
    db.test_db_all_scores()
    .catch((reason) =>{
        res.statusCode = 400
        res.send(reason)
    })
    .then((result) => {
        res.send(result);
    });
});

app.get('/leaderboard', (req, res) => {
    var offset = req.query.offset || 0;
    db.get_global_leaderboard(offset)
    .catch((reason) =>{
        res.statusCode = 400
        res.send(reason)
    })
    .then((result) => {
        res.send(result);
    });
});

app.get('/leaderboard/local', (req, res) => {
    var offset = req.query.offset || 0;
    var location = req.query.location;
    db.get_local_leaderboard(offset, location)
    .catch((reason) =>{
        res.statusCode = 400
        res.send(reason)
    })
    .then((result) => {
        res.send(result);
    });
});

app.get('/leaderboard/phone', (req, res) => {
    var offset = req.query.offset || 0;
    var phone = req.query.phone;
    db.get_phone_leaderboard(offset, phone)
    .catch((reason) =>{
        res.statusCode = 400
        res.send(reason)
    })
    .then((result) => {
        res.send(result);
    });
});

server.listen(port);
console.log('Server listening on port:', port);