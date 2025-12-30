

const express = require('express');
const path = require('path');
require('dotenv').config();

const sessionConfig = require('./config/session');
const connectDB = require('./config/connectDb');

const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');

const app = express();

/* VIEW ENGINE*/
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/* STATIC FILES*/
app.use(express.static(path.join(__dirname, 'public')));

/* BODY PARSER*/
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* SESSION */
app.use(sessionConfig);

/* MAKE SESSION USER AVAILABLE TO VIEWS*/
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});


app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

/* ROOT ROUTE */
app.get('/', (req, res) => {
  if (req.session.user) {
    return req.session.user.role === 'admin'
      ? res.redirect('/admin/dashboard')
      : res.redirect('/user/home');
  }
  res.redirect('/user/login');
});

/* ROUTES*/
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);


connectDB();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server started at: http://localhost:${PORT}`);
});
