const express = require('express');
const crypto = require('crypto')
const config = require('../lib/config')
const db = require('../lib/db')
const peerCounts = require('../lib/peer-counts')

var router = express.Router();

router.get('/', function(req, res, next) {
  serveIndex(undefined, req, res, next)
});

router.post('/', async function (req, res, next) {
  var msg
  try {
    var idtoken = req.cookies.idtoken || crypto.randomBytes(16).toString('base64')
    var driveUrl = req.body.driveUrl
    if (!driveUrl || typeof driveUrl !== 'string' || !/[0-9a-f]{64}/i.test(driveUrl)) {
      throw new Error('Please input a hyper URL')
    }
    driveUrl = `hyper://${/[0-9a-f]{64}/i.exec(driveUrl)[0]}`.toLowerCase()
    var title = typeof req.body.title === 'string' ? req.body.title : ''
    var description = typeof req.body.description === 'string' ? req.body.description : ''
    if (title.length > 100) title = title.slice(0, 100)
    if (description.length > 100) description = description.slice(0, 100)
    
    await db.upsert('users', '(idtoken)', {
      idtoken,
      driveUrl,
      title,
      description,
      updatedAt: db.knex.fn.now()
    })
    await db.knex('users_history').insert({
      driveUrl,
      title,
      description
    })
    msg = {type: 'success', text: '✔ Your listing has been updated.'}

    res.cookie('idtoken', idtoken, {
      httpOnly: true,
      expires: new Date(253402300000000),
      secure: config.getNodeEnv() === 'production'
    })
  } catch (e) {
    msg = {type: 'error', text: e.toString()}
  }
  serveIndex(msg, req, res, next)
})

router.delete('/', async function (req, res, next) {
  try {
    var idtoken = req.cookies.idtoken
    if (!idtoken || typeof idtoken !== 'string') throw new Error('ID Token is required')
    await db.knex('users').where({idtoken}).del()
    res.status(200).send('✔ Your listing has been removed.')
  } catch (e) {
    res.status(400).send(e.toString())
  }
})

router.get('/list.json', function(req, res, next) {
  db.knex('users').asCallback((err, users) => {
    if (err) return next(err)
    users.sort((a, b) => b.peerCount - a.peerCount)
    res.json({
      title: config.getServiceTitle(),
      users: users.map(user => ({
        driveUrl: user.driveUrl,
        title: user.title,
        description: user.description,
        peerCount: peerCounts.getCount(user.driveUrl)
      }))
    });
  })
});

router.post('/admin-list', async function(req, res, next) {
  try {
    var password = req.body.password
    if (!config.getAdminPassword() || password !== config.getAdminPassword()) {
      throw new Error('Incorrect password')
    }

    var driveUrl = req.body.driveUrl
    if (!driveUrl || typeof driveUrl !== 'string' || !/[0-9a-f]{64}/i.test(driveUrl)) {
      throw new Error('Please input a hyper URL')
    }
    driveUrl = `hyper://${/[0-9a-f]{64}/i.exec(driveUrl)[0]}`.toLowerCase()
    
    res.json(await db.knex('users').where({driveUrl}))
  } catch (e) {
    res.status(400).send(e.toString())
  }
});

router.post('/admin-update', async function (req, res, next) {
  try {
    var password = req.body.password
    if (!config.getAdminPassword() || password !== config.getAdminPassword()) {
      throw new Error('Incorrect password')
    }

    var idtoken = req.body.idtoken
    if (!idtoken) throw new Error('Invalid idtoken')
    var driveUrl = req.body.driveUrl
    if (driveUrl) {
      if (typeof driveUrl !== 'string' || !/[0-9a-f]{64}/i.test(driveUrl)) {
        throw new Error('Please input a hyper URL')
      }
      driveUrl = `hyper://${/[0-9a-f]{64}/i.exec(driveUrl)[0]}`.toLowerCase()
    }
    var title = typeof req.body.title === 'string' ? req.body.title : undefined
    var description = typeof req.body.description === 'string' ? req.body.description : undefined
    if (title.length > 100) title = title.slice(0, 100)
    if (description.length > 100) description = description.slice(0, 100)
    
    await db.knex('users').where({idtoken}).update({
      driveUrl,
      title,
      description,
      updatedAt: db.knex.fn.now()
    })
    await db.knex('users_history').insert({
      driveUrl,
      title,
      description
    })
    res.status(200).send('✔ Listing has been updated.')
  } catch (e) {
    res.status(400).send(e.toString())
  }
})

router.post('/admin-delete', async function (req, res, next) {
  try {
    var password = req.body.password
    if (!config.getAdminPassword() || password !== config.getAdminPassword()) {
      throw new Error('Incorrect password')
    }

    var idtoken = req.body.idtoken
    if (!idtoken) {
      throw new Error('Invalid idtoken')
    }
    await db.knex('users').where({idtoken}).del()
    res.status(200).send('✔ Listing has been removed.')
  } catch (e) {
    res.status(400).send(e.toString())
  }
})

function serveIndex (message, req, res, next) {
  db.knex('users').asCallback((err, users) => {
    if (err) return next(err)
    users.forEach(user => {
      user.peerCount = peerCounts.getCount(user.driveUrl)
    })
    users.sort((a, b) => b.peerCount - a.peerCount)
    var idtoken = req.cookies.idtoken
    res.render('index', {
      title: config.getServiceTitle(),
      form: req.body,
      users,
      myRecord: idtoken ? users.find(u => u.idtoken === idtoken) : undefined,
      message
    });
  })
}

module.exports = router;
