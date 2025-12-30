const bcrypt = require('bcryptjs');
const User = require('../models/User');

/*SHOW LOGIN*/
exports.showLogin = (req, res) => {
  // 🔒 Role-based redirect
  if (req.session.user?.role === 'user') {
    return res.redirect('/user/home');
  }

  if (req.session.user?.role === 'admin') {
    return res.redirect('/admin/dashboard');
  }

  res.render('user/login', { error: null });
};

/*LOGIN USER*/
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render('user/login', { error: 'Email and password required' });
    }

    const user = await User.findOne({ email,role:'user' });
    if (!user) {
      return res.render('user/login', { error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('user/login', { error: 'Invalid credentials' });
    }

    //Create session (shared for admin & user, role decides access)
    req.session.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    };

    // Save session before redirect
    req.session.save(err => {
      if (err) {
        console.error('Session save error:', err);
        return res.render('user/login', { error: 'Login failed' });
      }

      // Role-based redirect (CRITICAL FIX)
      if (user.role === 'admin') {
        return res.redirect('/admin/dashboard');
      }

      res.redirect('/user/home');
    });

  } catch (err) {
    console.error(err);
    res.render('user/login', { error: 'Something went wrong' });
  }
};

/* SHOW REGISTER*/
exports.showRegister = (req, res) => {
  //Role-based protection
  if (req.session.user?.role === 'user') {
    return res.redirect('/user/home');
  }

  if (req.session.user?.role === 'admin') {
    return res.redirect('/admin/dashboard');
  }

  res.render('user/register', { error: null });
};

/* REGISTER USER*/
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.render('user/register', { error: 'All fields required' });
    }

    if (password !== confirmPassword) {
      return res.render('user/register', { error: 'Passwords do not match' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.render('user/register', { error: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashed,
      role: 'user'
    });

    res.redirect('/user/login');

  } catch (err) {
    console.error(err);
    res.render('user/register', { error: 'Registration failed' });
  }
};

/* USER HOME*/
exports.userHome = (req, res) => {
  //HARD ROLE PROTECTION
  if (!req.session.user || req.session.user.role !== 'user') {
    return res.redirect('/user/login');
  }

  //Prevent back button access
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  res.render('user/home', {
    title: 'User Dashboard',
    user: req.session.user
  });
};

/*LOGOUT*/
exports.logoutUser = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.clearCookie('user_session');
    res.redirect('/user/login');
  });
};
