const express = require('express');
const config = require('../lib/config')
const db = require('../lib/db')

var router = express.Router();

router.get('/', function(req, res, next) {
  serveIndex(undefined, req, res, next)
});

router.post('/', async function (req, res, next) {
  var msg
  try {
    if (!req.user) {
      throw new Error('You must sign in first')
    }

    var driveUrl = req.body.driveUrl
    if (!driveUrl || typeof driveUrl !== 'string' || !/[0-9a-f]{64}/i.test(driveUrl)) {
      throw new Error('Please input a hyper URL')
    }
    driveUrl = `hyper://${/[0-9a-f]{64}/i.exec(driveUrl)[0]}`.toLowerCase()
    
    await db.upsert('twitter_users', '(username)', {
      username: req.user.username,
      driveUrl,
      updatedAt: db.knex.fn.now()
    })
    await db.knex('twitter_users_history').insert({
      username: req.user.username,
      driveUrl
    })
    msg = {type: 'success', text: '✔ Your hyperdrive has been updated.'}
  } catch (e) {
    msg = {type: 'error', text: e.toString()}
  }
  serveIndex(msg, req, res, next)
})

router.delete('/', async function (req, res, next) {
  var msg
  try {
    if (!req.user) {
      throw new Error('You must sign in first')
    }
    
    await db.knex('twitter_users').where({username: req.user.username}).del()
    res.status(200).send('✔ Your listing has been removed.')
  } catch (e) {
    res.status(400).send(e.toString())
  }
})

function serveIndex (message, req, res, next) {
  db.knex('twitter_users').asCallback((err, twitterUsers) => {
    if (err) return next(err)
    res.render('index', {
      title: config.getServiceTitle(),
      user: req.user,
      form: req.body,
      twitterUsers,
      message
    });
  })
}

module.exports = router;
