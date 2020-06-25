const crypto = require('crypto')

exports.up = async function (knex) {
  await knex.schema.createTable('users', (table) => {
    table.string('idtoken').primary()
    table.string('driveUrl')
    table.string('title')
    table.string('description')
    table.string('createdAt').defaultTo(knex.fn.now())
    table.string('updatedAt').defaultTo(knex.fn.now())
  })
  await knex.schema.createTable('users_history', (table) => {
    table.string('driveUrl')
    table.string('title')
    table.string('description')
    table.string('createdAt').defaultTo(knex.fn.now())
  })
  var twitterUsers = await knex('twitter_users')
  for (let user of twitterUsers) {
    await knex('users').insert({
      idtoken: crypto.randomBytes(16).toString('base64'),
      driveUrl: user.driveUrl,
      title: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    })
  }
}

exports.down = async function (knex) {
  await knex.schema.dropTable('users_history')
  await knex.schema.dropTable('users')
}