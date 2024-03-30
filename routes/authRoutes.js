const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup',authController.signup);
router.post('/login',authController.login);
router.get('/loginform', (req, res) => {
    res.render('Auth/login'); // Render the reservation form template
});

module.exports = router;