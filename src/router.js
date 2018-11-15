const express = require('express');
const router = express.Router();
const db = require('./db.js');

router.post('/score', (req, res) => {
    db.save_score(req.body)
    .catch((reason) =>{
        res.statusCode = 400
        res.send(reason)
    })
    .then((result) => {
        res.send(result);
    });
});

router.get('/score', (req, res) => {
    db.test_db_all_scores()
    .catch((reason) =>{
        res.statusCode = 400
        res.send(reason)
    })
    .then((result) => {
        res.send(result);
    });
});

router.get('/leaderboard', (req, res) => {
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

router.get('/leaderboard/local/:location', (req, res) => {
    var offset = req.query.offset || 0;
    var location = req.params.location;
    db.get_local_leaderboard(offset, location)
    .catch((reason) =>{
        res.statusCode = 400
        res.send(reason)
    })
    .then((result) => {
        res.send(result);
    });
});

router.get('/leaderboard/phone/:phone', (req, res) => {
    var offset = req.query.offset || 0;
    var phone = req.params.phone;
    db.get_phone_leaderboard(offset, phone)
    .catch((reason) =>{
        res.statusCode = 400
        res.send(reason)
    })
    .then((result) => {
        res.send(result);
    });
});

router.get('/leaderboard/personal/:device_token', (req, res) => {
    var offset = req.query.offset || 0;
    var device_token = req.params.device_token;
    db.get_personal_leaderboard(offset, device_token)
    .catch((reason) =>{
        res.statusCode = 400
        res.send(reason)
    })
    .then((result) => {
        res.send(result);
    });
});

router.put('/name/:device_token/:new_name', (req, res) => {
    var device_token = req.params.device_token;
    var new_name = req.params.new_name;
    db.update_name(device_token, new_name)
    .catch((reason) =>{
        res.statusCode = 400
        res.send(reason)
    })
    .then((result) => {
        res.send(result);
    });
})

module.exports = router;