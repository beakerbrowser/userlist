const express = require('express');
const db = require('../lib/db')

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  db.knex.raw('SELECT NOW()').asCallback((err, pgRes) => {
    if (err) return next(err)
    res.render('index', { title: 'Express', pgRes: pgRes.rows[0].now });
  })
});

module.exports = router;
