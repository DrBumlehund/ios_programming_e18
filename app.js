const express = require('express');
const app = express();
const server = require('http').createServer(app);
const bodyParser = require('body-parser');

const port = process.env.port || 9988;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', require('./src/router'));

server.listen(port);
console.log('Server listening on port:', port);