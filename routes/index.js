let express = require('express');
let router = express.Router();
let Database = require('../database/database');
let config = require('./config');
/* GET home page. */
router.get('/', function (req, res, next) {
    let title = 'Thank you for voting!';
    let database = new Database(config.getConfig());
    let ipAddress = req.connection.remoteAddress;
    let choice = req.query.choice;
    let survey = req.query.survey;
    let query = 'SELECT * FROM voting WHERE ipAddress = ? AND timeStamp > ?';
    let currentDate = new Date();
    let date = new Date();
    date.setMinutes(currentDate.getMinutes() - 30);
    database.query(query, [ipAddress, date])
        .then(rows => {
            let returnStatement = 'Select * from voting';
            if (rows.length) {
                title = 'Your vote has already been recorded';
            }
            else {
                returnStatement = 'INSERT INTO voting (ipAddress, survey, choice) VALUES(?,?,?)';
            }
            return database.query(returnStatement, [ipAddress, survey, choice]);
        })
        .then(() => {
            database.close();
            res.render('index', {title});
        })
        .catch(err => {
            console.log(err);
        });

});

router.get('/createQR', function (req, res, next) {
    res.render('createQR', {});
});

router.get('/surveys', function (req, res, next) {
    let database = new Database(config.getConfig());
    let surveys = {};
    database.query(`SELECT DISTINCT survey FROM voting`)
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
        })
        .then(() => {
            database.close();
            res.render('results', {results, name});
        })
        .catch(err => {
            console.log(err);
        });


});

module.exports = router;
