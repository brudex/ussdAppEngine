const httpController = require('../controllers/http.controller');
const dashboardController = require('../designcontrollers/dashboard.controller');
const express = require('express');
const router = express.Router();
const logger = require("../logger");

/* GET home page. */
router.get('/', function(req, res, next) {
    res.sendFile(path.join(__dirname+'/public/index.html'));
});

// router.post('/ussdgate/:telco',function(req,res){
//     logger.info("Request Received >>",req.body);
//     httpController.handleRequest(req,res);
// });

router.post('/ussd-provider/:provider',function(req,res){
    httpController.handleProviderRequest(req,res);
});

router.post('/ussd-app/:appId',function(req,res){
    logger.info("AppI  Received >>",req.params.appId);
     httpController.handleAppRequest(req,res);
});


router.post('/admin/manage', function(req,res){
    console.log(req.body);
    logger.info('Request Body received',req.body);
//    res.json({message:"success"});
   dashboardController.doAdminAction(req,res);
});



module.exports = router;
