const express = require('express');
const app = express();
const server = require('http').createServer(app);
const bodyParser = require('body-parser');
const db = require('./src/db.js');


const port = process.env.port || 9988;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/score', (req, res) => {
    db.save_score(req.body).then((result) => {
        res.send(result);
    });
});

app.get('/score', (req, res) => {
    db.test_db_all_scores().then((result) => {
        res.send(result);
    });
});

app.get('/leaderboard', (req, res) => {
    db.get_global_leaderboard().then((result) => {
        res.send(result);
    });
});

server.listen(port);
console.log('Server listening on port:', port);