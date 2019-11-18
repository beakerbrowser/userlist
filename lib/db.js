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
    return knex.migrate.latest()
  },

  async upsert (table, constraint, data) {
    const insert = knex(table).insert(data);
    const update = knex.queryBuilder().update(data);
    return knex.raw(`? ON CONFLICT ${constraint} DO ? returning *`, [insert, update]).get('rows').get(0);
  }
}