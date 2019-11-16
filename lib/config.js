const getNodeEnv = module.exports.getNodeEnv = function () {
  return process.env.NODE_ENV || 'development'
}

module.exports.getPGConfig = function () {
  if (getNodeEnv() === 'production') {
    return {
      host     : process.env.RDS_HOSTNAME,
      user     : process.env.RDS_USERNAME,
      password : process.env.RDS_PASSWORD,
      port     : Number(process.env.RDS_PORT),
      database : 'userlist'
    }
  }
  return {
    host     : process.env.PGHOST || 'localhost',
    user     : process.env.PGUSER,
    password : process.env.PGPASSWORD,
    port     : Number(process.env.PGPORT || '5432'),
    database : process.env.PGDATABASE || 'userlist'
  }
}