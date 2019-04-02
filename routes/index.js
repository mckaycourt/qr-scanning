let express = require('express');
let router = express.Router();
let Database = require('../database/database');
let config = require('./config');
/* GET home page. */
router.get('/vote', function (req, res, next) {
    let location = config.getLocation();
    let title = 'Thank you for voting!';
    let database = new Database(config.getConfig());
    let ipAddress = req.connection.remoteAddress;
    console.log(req.connection);
    let choice = req.query.choice;
    let survey = req.query.survey;
    // let query = 'SELECT * FROM voting WHERE ipAddress = ? AND timeStamp > ? AND survey = ?';
    let query = 'INSERT INTO voting (ipAddress, survey, choice) VALUES(?,?,?)';
    let currentDate = new Date();
    let date = new Date();
    date.setMinutes(currentDate.getMinutes() - 30);
    database.query(query, [ipAddress, survey, choice])
        .then(rows => {
            // let returnStatement = 'Select * from voting';
            // if (rows.length) {
            //     title = 'Your vote has already been recorded';
            // }
            // else {
            //     returnStatement = 'INSERT INTO voting (ipAddress, survey, choice) VALUES(?,?,?)';
            // }
            // return database.query(returnStatement, [ipAddress, survey, choice]);
            console.log('vote for ' + choice);
        })
        .then(() => {
            database.close();
            res.redirect(location+'/voted')
        })
        .catch(err => {
            console.log(err);
        });

});

router.get('/voted', function (req,res,next) {
    res.render('index', {title: 'Thank you for voting!'})
});

router.get('/', function (req, res, next) {
    let location = config.getLocation();
    res.render('createQR', {location});
});

router.get('/surveys', function (req, res, next) {
    let database = new Database(config.getConfig());
    let surveys = {};
    database.query(`SELECT name FROM surveys`)
        .then(rows => {
            surveys = rows;
            database.close();
            res.render('surveys', {surveys});
        })
        .catch(err => {
            console.log(err);
        })
});

router.get('/results', function (req, res, next) {
    let database = new Database(config.getConfig());
    let name = req.query.survey;
    let results = {};
    database.query(`SELECT choice, COUNT(*) FROM voting WHERE survey='${name}' GROUP BY choice`)
        .then(rows => {
            console.log(rows);
            results = rows;
            return database.query(`SELECT choices FROM surveys WHERE name = '${name}'`)
        })
        .then(rows => {
            database.close();
            let options = JSON.parse(rows[0].choices);
            res.render('results', {results, name, options});
        })
        .catch(err => {
            console.log(err);
        });
});

router.post('/createSurvey', function (req, res, next) {
    let location = config.getLocation();
    let database = new Database(config.getConfig());
    let name = req.body.name.replace(/\s/g, '');
    let choices = req.body.choices;
    database.query('INSERT INTO surveys (name, choices) VALUES (?, ?)', [name, choices])
        .then(() => {
            database.close();
            res.redirect(location+'/surveys');
        })
});

module.exports = router;
