var express = require('express');
var router = express.Router();
var logger = require("../logger");
const StatusCodes = require('../utils/statuscodes');
const jwtAuth = require('../middleware/jwt.auth');

/*****User routes*********************/
router.post('/user/login', function(req, res) {
    logger.info('Login payload>>',req.body);
    usersController.login(req.data,res) ; 
});

router.post('/user/register', function(req, res) {
    logger.info('Register payload>>',req.body);
    usersController.registerUser(req.data,res);
});

/*****Game routes*********************/
router.get('/game/info/statuscodes', function(req, res) {
    res.json(StatusCodes)
});

router.post('/game/play/vaglotto',jwtAuth, function(req, res) {
    logger.info('vaglotto payload>>',req.body);
    gameController.playVagLottoRequest(req,res);
});

router.post('/game/play/nla590', function(req, res) {
    logger.info('nla590 payload>>',req.body);
    gameController.playNLA590GameRequest(req,res);
});

router.post('/game/status/:reference', function(req, res) {
    gameController.getGameSttus(req.params.reference,function(respons){
        res.json(response);
    });
}); 
 

router.post('/game/results/:gameId', function(req, res, next) {
    res.json({
        status : "00",
        message : "No results available"
    })
});



module.exports = router;
