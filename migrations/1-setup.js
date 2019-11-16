exports.up = async function (knex) {
  await knex.schema.createTable('twitter_users', (table) => {
    table.string('username').primary()
    table.string('driveUrl')
    table.string('createdAt').defaultTo(knex.fn.now())
    table.string('updatedAt').defaultTo(knex.fn.now())
  })
  await knex.schema.createTable('twitter_users_history', (table) => {
    table.increments('id')
    table.string('username').index()
    table.string('driveUrl')
    table.string('createdAt').defaultTo(knex.fn.now())
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable('twitter_users_history')
  await knex.schema.dropTable('twitter_users')
}