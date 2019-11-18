function getNodeEnv () {
  return process.env.NODE_ENV || 'development'
}

function getOrigin () {
  if (getNodeEnv() === 'production') {
    return process.env.SERVICE_ORIGIN
  }
  return 'http://lvh.me:3000'
}

module.exports = {
  getNodeEnv,
  getOrigin,

  getServiceTitle () {
    return process.env.SERVICE_TITLE || 'Beaker Userlist'
  },

  getSessionKey () {
    return process.env.SESSION_KEY || 'keyboard cat'
  },

  getPGConfig () {
    if (getNodeEnv() === 'production') {
      return {
        host     : process.env.RDS_HOSTNAME,
        user     : process.env.RDS_USERNAME,
        password : process.env.RDS_PASSWORD,
        port     : Number(process.env.RDS_PORT),
        database : process.env.RDS_DB_NAME
      }
    }
    return {
      host     : process.env.PGHOST || 'localhost',
      user     : process.env.PGUSER,
      password : process.env.PGPASSWORD,
      port     : Number(process.env.PGPORT || '5432'),
      database : process.env.PGDATABASE || 'userlist'
    }
  },

  getPassportConfig () {
    return {
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: `${getOrigin()}/login/twitter/callback`
    }
  }
}