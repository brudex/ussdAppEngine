const MenuDesignFactory = require('../../designcontrollers/menudesign.controller').MenuDesignFactory();
const ActionDesignFactory = require('../../designcontrollers/actiondesign.controller').ActionDesignFactory();
const Operators = require('../../controllers/operator.contants');
const ValidationOperation = require('../../controllers/validation.operators');

 const appId ='nla590AndVag';
/**************NLA Main Menu Definitions*********/
const mainMenu = MenuDesignFactory.createNew('Welcome to NLA official USSD.','mainMenu',appId);
mainMenu.addText('VAG 590 Morning Event No. {{session.inputs.drawEventVag}}');
mainMenu.addText('Enter 1 to continue');
mainMenu.isFirst=true;

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

const vagLottoPage5 = MenuDesignFactory.createNew('VAG 590 Morning Please confirm. Your resultant Stake Amount is GHS{{env.amountToPay}}. Enter :','confirmAmount',appId);
vagLottoPage5.addListItem('1','Confirm');
vagLottoPage5.addListItem('2','Cancel');
vagLottoPage5.setParent(vagLottoPage4.uniqueId);

const finish = MenuDesignFactory.createNew('Your bet has been successfully placed. Please check your phone to approve transaction','finish',appId);
finish.terminate = true;

/****************Switch Operations************/
mainMenu.switchOperation.IfInput(Operators.eq,'1').goto(vagLottoPage1.uniqueId);
mainMenu.switchOperation.IfInput(Operators.ne,'1').terminate();
vagLottoPage5.switchOperation.IfInput(Operators.eq,'1').goto(finish.uniqueId);
vagLottoPage5.switchOperation.IfInput(Operators.eq,'2').terminate();


/*************Input Validations*********************/
mainMenu.validateInput().operation(ValidationOperation.valueIn,'1').errorMessage('Please select a valid option');
vagLottoPage1.validateInput().operation(ValidationOperation.valueIn,'1,2,3,4,5,6,7,8,9,10').errorMessage('Please select a valid option');
 let vagLottoPage2Validation = vagLottoPage2.validateInput();
 vagLottoPage2Validation.validationFunction =numbersInputValidationFuntion;
function numbersInputValidationFuntion(input,session){
    let directInput = session.inputs.directOption;
    let result = {valid:true,errorMessage : ''};
    let numberInput = input;
    if (numberInput == null) {
        numberInput = '';
    }
    let validationErrors = [];
    let betNumbers = numberInput.split(/[,;\s]/);
    let directOption = 0;
    if (!isNaN(directInput) && isFinite(directInput)) {
        directOption = parseInt(directInput);
    } else {
        return getErrorResult('Invalid input for permutation');
    }
    if(/^[0-9\s]+$/g.test(numberInput)===false){
        return getErrorResult('Invalid input. Separate numbers with space');
    }
    const allNumberic = betNumbers.every((element) => {
        console.log('The element >>'+element);
        if (!isNaN(element) && isFinite(element)) {
            return !(Number(element) < 1 || Number(element) > 90);

        }
        return false;
    });
    function hasDuplicates(array) {
        return (new Set(array)).size !== array.length;
    }
    if(!allNumberic){
         return getErrorResult("Invalid input. Bet numbers must be between 1 and 90");
    }
    if(hasDuplicates(betNumbers)){
        return getErrorResult("Bet numbers cannot be repeated");
    }
    switch (directOption) {
        case 1:
            if (betNumbers.length !== directOption) {
                validationErrors.push('Direct 1 requires  1 number.')
            }
            break;
        case 2:
        case 3:
        case 4:
        case 5:
            if (betNumbers.length !== directOption) {
                validationErrors.push(`Direct ${directOption} requires  ${directOption} numbers.`)
            }
            break;
        case 6:
            if (betNumbers.length < 3 && betNumbers.length >16) {
                validationErrors.push('Perm 2 needs a minimum of 3 numbers for valid bet. A maximum of 16 numbers.')
            }
            break;
        case 7:
            if (betNumbers.length < 4 && betNumbers.length >16) {
                validationErrors.push('Perm 3 needs a minimum of 4 numbers for valid bet. A maximum of 16 numbers.')
            }
            break;
        case 8:
            if (betNumbers.length < 5 && betNumbers.length >16) {
                validationErrors.push('Perm 4 needs a minimum of 5 numbers for valid bet. A maximum of 16 numbers.')
            }
            break;
        case 9:
            if (betNumbers.length < 6 && betNumbers.length >16) {
                validationErrors.push('Perm 5 needs a minimum of 6 numbers for valid bet. A maximum of 16 numbers.')
            }
            break;
        case 10:
            if (betNumbers.length !== 1 ) {
                validationErrors.push('Banker 1 needs 1 number')
            }
        default:
            validationErrors.push('Invalid Permutation option');
            break;
    }
    function getErrorResult(msg){
        let res ={};
        res.valid=false;
        res.errorMessage =msg;
        return res
    }
    if(validationErrors.length){
        result.valid=false;
        result.errorMessage =validationErrors.join('\n');
    }
    return result;
}





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

const vagLottoPage4Action = ActionDesignFactory.createNew('confirmAmount',vagLottoPage3.uniqueId,'javascript','post',appId);
vagLottoPage4Action.actionCode = function () {
    const gameData = {
        mobile:this.session.mobile,
        network:this.session.network,
        directOption:this.session.inputs['directOption'],
        gameOption: "2",
        numberToPlay : this.session.inputs.numberToPlay,
        betAmount : this.inRequest.input,
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
    this.session.setMenuEnvVariable('amountToPay',amounToPay);
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