const express = require('express');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const controllers = require('../controllers/usersController');

router.get('/', controllers.index);
router.get('/login', controllers.loginForm);
router.post('/login', controllers.login);

router.get('/registerForm', controllers.showRegisterForm)
router.post('/register', controllers.registerNewUser)

router.get('/logout', requireAuth, controllers.logout);
router.get('/profile', requireAuth, controllers.myProfile);
router.get('/users', requireAuth, controllers.showListOfUsers);
router.get('/add', requireAuth, controllers.addNewUserForm);
router.post('/addToDB', requireAuth, controllers.addUserToDB);
router.get('/users/:id/edit', requireAuth, controllers.editUserForm);
router.post('/users/:id/update', requireAuth, controllers.updateUser);
router.post('/users/:id/delete', requireAuth, controllers.deleteUser);
router.post('/users/:id/add-point', requireAuth, controllers.addPoint);
router.get('/users/:identifier', requireAuth, async (req, res, next) => {
    const { identifier } = req.params;
    if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
        req.params.id = identifier;
        return controllers.showUserById(req, res, next);
    } else {
        req.params.username = identifier;
        return controllers.showUserByUsername(req, res, next);
    }
});
router.get('/faq', controllers.goToFAQ);

module.exports = router;