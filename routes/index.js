let express = require('express');
let router = express.Router();
let Database = require('../database/database');
let config = require('./config');
/* GET home page. */
router.get('/', function(req, res, next) {
  let title = 'Thank you for voting!';
  let database = new Database(config.getConfig());
  let ipAddress = req.connection.remoteAddress;
  let choice = req.query.choice;
  let query = 'SELECT * FROM voting WHERE choice = ? AND TimeStamp > ?';
  let date = new Date();

  database.query(query, [choice])
      .then(rows => {
        let returnStatement = 'Select * from voting';
        if(rows.length) {
          title = 'Your vote has already been recorded';
        }
        else {
          returnStatement = 'INSERT INTO voting (id, choice) VALUES(?,?)';
        }
        return database.query(returnStatement, [ipAddress, choice]);
      })
      .then(() => {
        database.close();
        res.render('index', { title });
      })
      .catch(err => {
        console.log(err);
      });
  console.log(`insert into database: id=${req.connection.remoteAddress} choice = ${choice}`);

  //TODO Check database for ip address and time within 30 minutes if longer than that allow if not deny


});

module.exports = router;
