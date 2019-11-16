const express = require('express');
const db = require('../lib/db')

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  db.knex('twitter_users').asCallback((err, pgRes) => {
    if (err) return next(err)
    console.log(pgRes)
    res.render('index', { title: 'Express', pgRes: `current users: ${JSON.stringify(pgRes)}` });
  })
});

module.exports = router;
