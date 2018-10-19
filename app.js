var express = require('express');
var app = express();
var server = require('http').createServer(app);
var bodyParser = require('body-parser');


const port = process.env.port || 9988;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/', (req, res) => {

})


server.listen(port);
console.log('Server listening on port:', port);