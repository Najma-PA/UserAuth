const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdminAuth } = require('../middleware/auth');

router.get('/login', adminController.showAdminLogin);
router.post('/login', adminController.adminLogin);

router.get('/dashboard', isAdminAuth, adminController.adminDashboard);

router.get('/search', isAdminAuth, adminController.searchUsers);

router.get('/create', isAdminAuth, adminController.showCreateUser);
router.post('/create', isAdminAuth, adminController.createUser);

router.get('/edit/:id', isAdminAuth, adminController.showEditUser);
router.post('/edit/:id', isAdminAuth, adminController.updateUser);

router.get('/delete/:id', isAdminAuth, adminController.deleteUser);

router.post('/logout', adminController.adminLogout);

module.exports = router;


