const session = require('express-session');

const sessionConfig = session({
  name: 'user_session',
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 // 1 hour
  }
});

module.exports = sessionConfig;


