const dht = require('@hyperswarm/dht')
const crypto = require('hypercore-crypto')

const MIN_TIME_PER_LIST = 60e3 * 5 // 5min between full runs at minimum

const node = dht({ephemeral: true})
const countsCache = {} // map of {[url] => count}

function countPeers (pubkey) {
  const topic = crypto.discoveryKey(Buffer.from(pubkey, 'hex'))
  const peers = new Set()
  return new Promise((resolve, reject) => {
    node.lookup(topic)
      .on('data', hit => {
        for (let peer of hit.peers) {
          peers.add(`${peer.host}:${peer.port}`)
        }
      })
      .on('error', reject)
      .on('end', function () {
        resolve(peers.size)
      })
  })
}

exports.start = async function (db) {
  while (true) {
    let startTime = Date.now()
    let users = await db.knex('twitter_users')
    for (let user of users) {
      try {
        let pubkey = /([0-9a-f]{64})/i.exec(user.driveUrl)[1]
        countsCache[user.driveUrl] = await countPeers(pubkey)
      } catch (e) {
        console.log('Error while fetching peer count:', e)
      }
    }

    // don't just slam the DHT, enforce a minimum time passage per run
    // (as we get more users this will have no effect)
    let timePassed = Date.now() - startTime
    if (MIN_TIME_PER_LIST - timePassed > 0) {
      await new Promise(r => setTimeout(r, MIN_TIME_PER_LIST - timePassed))
    }
  }
}

exports.getCount = function (url) {
  return countsCache[url] || 0
}