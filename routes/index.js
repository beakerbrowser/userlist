const express = require('express');
const config = require('../lib/config')
const db = require('../lib/db')

var router = express.Router();

router.get('/', function(req, res, next) {
  serveIndex(undefined, req, res, next)
});

router.post('/update', function (req, res, next) {
  // TODO 
  serveIndex({type: 'success', text: 'TODO'}, req, res, next)
})

function serveIndex (message, req, res, next) {
  console.log('serveIndex user:', req.user)
  db.knex('twitter_users').asCallback((err, twitterUsers) => {
    if (err) return next(err)
    res.render('index', {
      title: config.getServiceTitle(),
      user: req.user,
      twitterUsers,
      message
    });
  })
}

module.exports = router;
