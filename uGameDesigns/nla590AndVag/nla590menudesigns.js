const MenuDesignFactory = require('../../designcontrollers/menudesign.controller').MenuDesignFactory();
const ActionDesignFactory = require('../../designcontrollers/actiondesign.controller').ActionDesignFactory();
const Operators = require('../../controllers/operator.contants');

 const appId ='nla590AndVag';
/**************NLA Main Menu Definitions*********/
const mainMenu = MenuDesignFactory.createNew('Welcome to NLA official USSD. Please select game option','mainMenu',appId);
mainMenu.addListItem('1','NLA 590 Event No. {{session.inputs.drawEvent590}}');
mainMenu.addListItem('2','VAG 590 Event No. {{session.inputs.drawEventVag}}');
mainMenu.isFirst=true;


/**************NLA 590 Menu Definitions*********/
const nla590Page1 = MenuDesignFactory.createNew('NLA 5 90 Select Your Bet Option','directOption',appId);
 nla590Page1.addListItem('1','Direct 1');
 nla590Page1.addListItem('2','Direct 2');
 nla590Page1.addListItem('3','Direct 3');
 nla590Page1.addListItem('4','Direct 4');
 nla590Page1.addListItem('5','Direct 5');
 nla590Page1.addListItem('6','Perm 2');
 nla590Page1.addListItem('7','Perm 3');
 nla590Page1.addListItem('8','Perm 4');
 nla590Page1.addListItem('9','Perm 5');
 nla590Page1.addListItem('10','Banker 1');


const nla590Page2 = MenuDesignFactory.createNew('NLA 5 90. You have selected {{session.inputs.directMsg}}.','numberToPlay',appId);
nla590Page2.addText('{{session.inputs.numberChooseMessage}}');
nla590Page2.setParent(nla590Page1.uniqueId);

const nla590Page3 = MenuDesignFactory.createNew('NLA 5 90 - Enter bet amount (GHS 1 or more)','betAmount',appId);
nla590Page3.setParent(nla590Page2.uniqueId);

const nla590Page4 = MenuDesignFactory.createNew('NLA 5 90 - Enter Retailer ID or 1 if not referred by a retailer','retailerId',appId);
nla590Page4.setParent(nla590Page3.uniqueId);

const nla590Page5 = MenuDesignFactory.createNew('NLA 5 90 Please confirm your resultant Stake Amount is GHS{{session.inputs.amountToPay}}. Enter :','confirmAmount',appId);
nla590Page5.addListItem('1','Confirm');
nla590Page5.addListItem('2','Cancel');
nla590Page5.setParent(nla590Page4.uniqueId);


/**************VAG 590 Definitions*********/
const vagLottoPage1 = MenuDesignFactory.createNew('VAG 590 Morning. Select Your Bet Option','directOption',appId);
vagLottoPage1.addListItem('1','Direct 1');
vagLottoPage1.addListItem('2','Direct 2');
vagLottoPage1.addListItem('3','Direct 3');
vagLottoPage1.addListItem('4','Direct 4');
vagLottoPage1.addListItem('5','Direct 5');
vagLottoPage1.addListItem('6','Perm 2');
vagLottoPage1.addListItem('7','Perm 3');
vagLottoPage1.addListItem('8','Perm 4');
vagLottoPage1.addListItem('9','Perm 5');
vagLottoPage1.addListItem('10','Banker');


const vagLottoPage2 = MenuDesignFactory.createNew('VAG 590 Morning. You have selected {{session.inputs.directMsg}}.','numberToPlay',appId);
vagLottoPage2.addText('{{session.inputs.numberChooseMessage}}');
vagLottoPage2.setParent(vagLottoPage1.uniqueId);

const vagLottoPage3 = MenuDesignFactory.createNew('VAG 590 Morning.','betAmount',appId);
vagLottoPage3.addText('Enter bet amount (GHS 1 or more)');
vagLottoPage3.setParent(vagLottoPage2.uniqueId);

const vagLottoPage4 = MenuDesignFactory.createNew('VAG 590 Morning - Enter Retailer ID or 1 if not referred by a retailer','retailerId',appId);
vagLottoPage4.setParent(vagLottoPage3.uniqueId);

const vagLottoPage5 = MenuDesignFactory.createNew('VAG 590 Morning Please confirm. Your resultant Stake Amount is GHS{{session.inputs.amountToPay}}. Enter :','confirmAmount',appId);
vagLottoPage5.addListItem('1','Confirm');
vagLottoPage5.addListItem('2','Cancel');
vagLottoPage5.setParent(vagLottoPage4.uniqueId);

const finish = MenuDesignFactory.createNew('Your bet has been successfully placed. Please check your phone to approve transaction','finish',appId);
finish.terminate = true;

/****************Switch Operations************/
mainMenu.switchOperation.IfInput(Operators.eq,'1').goto(nla590Page1.uniqueId);
mainMenu.switchOperation.IfInput(Operators.eq,'2').goto(vagLottoPage1.uniqueId);

nla590Page5.switchOperation.IfInput(Operators.eq,'1').goto(finish.uniqueId);
vagLottoPage5.switchOperation.IfInput(Operators.eq,'1').goto(finish.uniqueId);

nla590Page5.switchOperation.IfInput(Operators.eq,'2').terminate();
vagLottoPage5.switchOperation.IfInput(Operators.eq,'2').terminate();


/****************Actions Definitions************/
const mainMenuPreAction = ActionDesignFactory.createNew('mainMenuPreAction',mainMenu.uniqueId,'javascript','pre',appId);
mainMenuPreAction.actionCode = function () {
    console.log('actionFactory mainMenuPreAction');
    let drawEvent = this.memDb.getObject('drawEvent');
    if(drawEvent){
        this.session.setSessionValue('drawEvent590',drawEvent.drawEvent590);
        this.session.setSessionValue('drawEventVag',drawEvent.drawEventVag);
    }
};

const vagLottoPage1Action = ActionDesignFactory.createNew('getNumberInputMessageVag',vagLottoPage1.uniqueId,'javascript','post',appId);
const nla590Page1Action = ActionDesignFactory.createNew('getNumberInputMessageNla',nla590Page1.uniqueId,'javascript','post',appId);
function getNumberInputMessage(){
     const directOption = this.inRequest.input;
    let message ='';
     console.log('getNumberInputMessage >>'+directOption);
     let directMsg ='';
     if(!isNaN(directOption) && isFinite(directOption)){

        switch(Number(directOption)){
            case 1 :
                message = `Enter 1 number to play\n(Eg. 20 )`;
                directMsg = 'Direct 1';
                break;
            case 2 :
                message = `Enter 2 numbers to play\n(Eg. 20 30 )`;
                directMsg = 'Direct 2';
                break;
            case 3 :
                message = `Enter 3 numbers to play\n(Eg. 20 30 40 )`;
                directMsg = 'Direct 3';
                break;
            case 4 :
                message = `Enter 4 numbers to play\n(Eg. 20 30 40 50 )`;
                directMsg = 'Direct 4';
                break;
            case 5 :
                message = `Enter 5 numbers to play\n(Eg. 20 30 40 50 60 )`;
                directMsg = 'Direct 5';
                break;
            case 6 :
                message = `Enter a minimum of 3 numbers to play (Eg 20 30 40).`;
                directMsg = 'Perm 2';
                break;
            case 7 :
                message = `Enter a minimum of 4 numbers to play\n(Eg. 20 30 40 )`;
                directMsg = 'Perm 3';
                break;
            case 8 :
                message = `Enter a minimum of 5 numbers to play.  (Eg 20 30 40 50 60 )`;
                directMsg = 'Perm 4';
                break;
            case 9 :
                  message = `Enter a minimum 6 numbers to play\n(Eg. 20 30 40 50 60 )`;
                directMsg = 'Perm 5';
                  break;
            case 10 :
                message = `Enter 1 number to play\n(Eg. 20 )`;
                directMsg = 'Banker 1';
                break;
            default:

        }
    }
    this.session.setSessionValue('numberChooseMessage',message);
    this.session.setSessionValue('directMsg',directMsg);
}
vagLottoPage1Action.actionCode =getNumberInputMessage;
nla590Page1Action.actionCode =getNumberInputMessage;

const nla590Page4Action = ActionDesignFactory.createNew('confirmAmount',nla590Page4.uniqueId,'javascript','post',appId);
nla590Page4Action.actionCode = function () {

    const gameData = {
        mobile:this.session.mobile,
        network:this.session.network,
        directOption:this.session.inputs['directOption'],
        gameOption: "1",
        numberToPlay : this.session.inputs.numberToPlay,
        betAmount : this.session.inputs.betAmount,
        machineOption: "1",
        confirmAmount : "1",
        lottoComp : "1"
    };

    console.log('AppUtils found '+JSON.stringify(gameData));
    let computResult = this.appUtils.computeSubTypeBetType(gameData);
    var stakeNos = computResult.stakeNos;
    let stakeAmount = Number(computResult.stakeAmount);
    let betType = computResult.betType;
    let subType = computResult.subType;
    console.log(`the calculateTotalAmount  bettype ${betType} subtype ${subType}`);
    console.log(`the calculateTotalAmount stakeNos >>`+JSON.stringify(stakeNos));
    console.log(`the calculateTotalAmount stakeAmount >>`+stakeAmount);
    var total_betCount = this.appUtils.calculateBetCount(stakeNos, subType, betType, stakeAmount);
    console.log(`the calculateTotalAmout totalBetcount >>`+JSON.stringify(total_betCount));
    const totalAmount = (Math.round(total_betCount[0]))/100;
    totalAmount.toFixed(2);
    let amounToPay = totalAmount.toFixed(2);
    this.session.setSessionValue('amountToPay',amounToPay);
};

const vagLottoPage4Action = ActionDesignFactory.createNew('confirmAmount',vagLottoPage4.uniqueId,'javascript','post',appId);
vagLottoPage4Action.actionCode = function () {
    const gameData = {
        mobile:this.session.mobile,
        network:this.session.network,
        directOption:this.session.inputs['directOption'],
        gameOption: "2",
        numberToPlay : this.session.inputs.numberToPlay,
        betAmount : this.session.inputs.betAmount,
        machineOption: "1",
        confirmAmount : "1",
        lottoComp : "1"
    };
    console.log('AppUtils found '+JSON.stringify(gameData));
    let computResult = this.appUtils.computeSubTypeBetType(gameData);
    const stakeNos = computResult.stakeNos;
    let stakeAmount = Number(computResult.stakeAmount);
    let betType = computResult.betType;
    let subType = computResult.subType;
    console.log(`the calculateTotalAmount  bettype ${betType} subtype ${subType}`);
    console.log(`the calculateTotalAmount stakeNos >>`+JSON.stringify(stakeNos));
    console.log(`the calculateTotalAmount stakeAmount >>`+stakeAmount);
    const total_betCount = this.appUtils.calculateBetCount(stakeNos, subType, betType, stakeAmount);
    console.log(`the calculateTotalAmount totalBetcount >>`+JSON.stringify(total_betCount));
    const totalAmount = (Math.round(total_betCount[0]))/100;
    totalAmount.toFixed(2);
    let amounToPay = totalAmount.toFixed(2);
    this.session.setSessionValue('amountToPay',amounToPay);
};



const finishPostGameAction =  ActionDesignFactory.createNew('finishAction',finish.uniqueId,'dbaccess','pre',appId);
finishPostGameAction.actionCode = function (){
    let inputs =this.session.inputs;
    inputs.mobile = this.session.mobile;
    inputs.network = this.session.network;
    console.log('Calling stringify >>',inputs);
    let userInputs = JSON.stringify(inputs);
    this.query = {
        Mobile:this.session.mobile,
        GameData :userInputs,
        Network : this.session.network,
        ProcessStatus:'Queued'
    };
    this.tableName = "GameRequest";
    this.queryType = 'insert';
};


MenuDesignFactory.saveAllMenus();
ActionDesignFactory.saveAllActions();