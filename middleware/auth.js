
exports.isUserAuth = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'user') {
    return res.redirect('/user/login');
  }
  next();
};

exports.isAdminAuth = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/admin/login');
  }
  next();
};

const User = require('../models/User');

