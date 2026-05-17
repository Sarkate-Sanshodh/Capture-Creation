const express = require("express")
const router = express.Router();
const authController = require('../controller/authController') 
router.get('/signup' , authController.signup_get);
router.post('/signup' , authController.signup_post);
router.get('/login' , authController.login_get);
router.post("/login" , authController.login_post);
router.get("/logout" , authController.logout_get);
router.get('/verify-otp', authController.verify_otp_get);
router.post('/verify-otp', authController.verify_otp_post);

module.exports = router;