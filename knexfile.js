module.exports = {
  client: 'pg',
  connection: require('./lib/config').getPGConfig()
}