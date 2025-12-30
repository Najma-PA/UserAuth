
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isUserAuth } = require('../middleware/auth');

router.get('/register', userController.showRegister);
router.post('/register', userController.registerUser);

router.get('/login', userController.showLogin);
router.post('/login', userController.loginUser);


router.get('/home', isUserAuth, userController.userHome);


router.get('/logout', userController.logoutUser);
router.post('/logout', userController.logoutUser);

module.exports = router;

