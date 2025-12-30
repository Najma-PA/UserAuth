const bcrypt = require('bcryptjs');
const User = require('../models/User');

/* ADMIN LOGIN*/
exports.showAdminLogin = (req, res) => {
  if (req.session.user?.role === 'admin') {
    return res.redirect('/admin/dashboard');
  }

  res.render('admin/login', {
    title: 'Admin Login',
    error: null
  });
};

exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.render('admin/login', { error: 'All fields required' });
    }

    const admin = await User.findOne({
      email: username,
      role: 'admin'
    });

    if (!admin) {
      return res.render('admin/login', { error: 'Invalid admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.render('admin/login', { error: 'Invalid admin credentials' });
    }

    req.session.user = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: 'admin'
    };

    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.render('admin/login', { error: 'Login failed' });
  }
};

/* DASHBOARD (VIEW USERS)*/
exports.adminDashboard = async (req, res) => {
  const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });

  res.render('admin/dashboard', {
    title: 'Admin Dashboard',
    admin: req.session.user,
    users
  });
};

/* SEARCH USERS*/
exports.searchUsers = async (req, res) => {
  const { keyword } = req.query;

  const users = await User.find({
    role: 'user',
    $or: [
      { name: { $regex: keyword, $options: 'i' } },
      { email: { $regex: keyword, $options: 'i' } }
    ]
  });

  res.render('admin/dashboard', {
    title: 'Admin Dashboard',
    admin: req.session.user,
    users
  });
};

/* CREATE USER*/
exports.showCreateUser = (req, res) => {
  res.render('admin/createUser', { error: null });
};

exports.createUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.render('admin/createUser', { error: 'All fields required' });
  }

  const exists = await User.findOne({ email });
  if (exists) {
    return res.render('admin/createUser', { error: 'Email already exists' });
  }

  const hashed = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hashed,
    role: 'user'
  });

  res.redirect('/admin/dashboard');
};

/*  EDIT USER*/
exports.showEditUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  res.render('admin/editUser', { user, error: null });
};

exports.updateUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      email: req.body.email
    });

    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.render('admin/editUser', {
      user: await User.findById(req.params.id),
      error: 'Update failed'
    });
  }
};

/*  DELETE USER*/
exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/admin/dashboard');
};

/*  LOGOUT */
exports.adminLogout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Admin logout error:', err);
    }

    res.clearCookie('user_session');
   return res.redirect('/admin/login');
  });
};
