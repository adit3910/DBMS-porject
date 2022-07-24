const express=require('express');
const req = require('express/lib/request');
const authController=require('../controllers/auth')
const router=express.Router();
//router.post('/pay/:prid',authController.pay);
router.get('/projok/:pid',authController.accept);
router.get('/project/:id',authController.project);
router.post('/register',authController.register);
router.post('/login',authController.login);
router.get('/logout',authController.logout);
router.post('/userregister',authController.userregister);
router.post('/userlogin',authController.userlogin);

module.exports=router;