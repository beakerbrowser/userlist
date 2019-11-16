const CreateKnex = require('knex')
const { getPGConfig } = require('./config')

var knex

module.exports = {
  get knex () {
    return knex
  },

  async setup () {
    knex = CreateKnex({
      client: 'pg',
      connection: getPGConfig()
    })
    // TODO return knex.migrate.latest()
  }
}