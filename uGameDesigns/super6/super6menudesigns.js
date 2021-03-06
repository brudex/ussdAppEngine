const MenuPage = require('../../designcontrollers/menudesign.controller').Menu;
const UssdAction = require('../../designcontrollers/actiondesign.controller').UssdAction;
const Operators = require('../../controllers/operator.contants');
const ValidationOperation = require('../../controllers/validation.operators');

const appId ='super6';
/**************Menu Definitions*********/
const mainMenu = new MenuPage('Super 6 Event No. {{session.inputs.drawNo}}','mainMenu',appId);
mainMenu.addListItem('',' Please select and option :');
mainMenu.addListItem('1','PICK 6');
mainMenu.addListItem('2','PICK 5');
mainMenu.addListItem('3','PICK 4');
mainMenu.addListItem('4','PICK 3');
mainMenu.addListItem('5','PICK 2');
mainMenu.addListItem('6','PICK 1');
mainMenu.addListItem('7','Draw Result');
mainMenu.isFirst=true;


const pick5 = new MenuPage('{{session.inputs.itemPicked}}','pick5',appId);
pick5.addText('Please select an option');
pick5.addListItem('1','Random Number');
pick5.addListItem('2','Choose Your Number');
pick5.addListItem('0','Back');
pick5.setParent(mainMenu.uniqueId);

const drawResult = new MenuPage('Draw Result','drawResult',appId);
drawResult.addListItem('','005 - 01 02 03 04 05');
drawResult.addListItem('','004 - 01 02 03 04 05');
drawResult.addListItem('','003 - 01 02 03 04 05');
drawResult.addListItem('','002 - 01 02 03 04 05');
drawResult.addListItem('','001 - 01 02 03 04 05');
drawResult.addListItem('0',' Back');

const pick5ChooseNumbers = new MenuPage('{{session.inputs.itemPicked}}','pick5chooseNumber',appId);
pick5ChooseNumbers.addListItem('','Please Enter at {{env.enterLabel}}');
pick5ChooseNumbers.setParent(pick5.uniqueId);


const enterAmount = new MenuPage('{{session.inputs.itemPicked}}','amount',appId);
enterAmount.addListItem('','Please Enter Bet Amount');
enterAmount.addListItem('','(GHC 1.00 or more)');
enterAmount.addListItem('','Your Bet:');
enterAmount.addListItem('','{{session.inputs.pick5chooseNumber}}');
enterAmount.setParent(pick5ChooseNumbers.uniqueId);


const confirmation = new MenuPage('Confirmation','confirmation',appId);
confirmation.addListItem('','You have placed GHS {{session.inputs.amount}} Bet',appId);
confirmation.addListItem('1','Confirm');
confirmation.addListItem('2','Cancel');
confirmation.setParent(enterAmount.uniqueId);

const finish = new MenuPage('Your bet has been successfully placed. Please check your phone to approve transaction','finish');
finish.terminate = true;

/****************Switch Operations************/
pick5.switchOperation.IfInput(Operators.eq,'1').goto(enterAmount.uniqueId);
mainMenu.switchOperation.IfInput(Operators.eq,'7').goto(drawResult.uniqueId);
confirmation.switchOperation.IfInput(Operators.eq,'1').goto(finish.uniqueId);

/****************Validations*****************/
mainMenu.validateInput().operation(ValidationOperation.valueIn,'1,2,3,4,5,6,7').errorMessage('Please select a valid option');
let pick5ChooseNumbersValidation = pick5ChooseNumbers.validateInput();
pick5ChooseNumbersValidation.validationFunction = function(input,session){
    let mainMenuOption = session.inputs.mainMenu;
    let result = {valid:true,errorMessage : ''};
    console.log('The validation input values are >>>'+input);
    console.log('The validation input mainMenuOption values are >>>'+mainMenuOption);
   if(input){
       let arr = input.split(/[,;\s]/);
       console.log('The validation input after split are >>>',JSON.stringify(arr));
       let mapArr = {};
       mapArr['1'] = '6';
       mapArr['2'] = '5';
       mapArr['3'] = '4';
       mapArr['4'] = '3';
       mapArr['5'] = '2';
       mapArr['6'] = '1';
       let inputLen = mapArr[mainMenuOption];
       console.log('The validation result >>>',JSON.stringify(result));
       if(arr.length !== Number(inputLen)){
           result.valid= false;
           result.errorMessage = `You have to choose ${inputLen} numbers`;
           console.log('The validation result >>>',JSON.stringify(result));
           return result;
       }

       if(arr.length){
           for(let k=0,len=arr.length;k<len;k++){
               let n= arr[k];
               if(!isNaN(n) && isFinite(n)){
                    if(Number(n)> 55){
                        result.valid= false;
                        result.errorMessage = "You can't choose numbers above 55";
                        console.log('The validation result >>>',JSON.stringify(result));
                        break;
                    }
               }
           }
       }
       console.log('The validation result >>>',JSON.stringify(result));

   }
    return result;
};


pick5ChooseNumbersValidation.errorMessage('Invalid input. Choose numbers between 1 to 55');
mainMenu.save();
pick5.save();
drawResult.save();
pick5ChooseNumbers.save();
enterAmount.save();
confirmation.save();
finish.save();


/****************Actions Defintions************/
const mainMenuAction = new UssdAction('mainMenuAction',mainMenu.uniqueId,'javascript','post',appId);
mainMenuAction.actionCode = function () {
    console.log('actionFactory mainMenuAction');
    let input = this.inRequest.input;
    console.log('actionFactory inRequest input>>'+this.inRequest.input);
    if(!isNaN(input) && isFinite(input)){
        let pickNumber = 0;
        switch (parseInt(input)) {
            case 1 :
                pickNumber = 6;break;
            case 2 :
                pickNumber = 5;break;
            case 3 :
                pickNumber = 4;break;
            case 4 :
                pickNumber = 3;break;
            case 5 :
                pickNumber = 2;break;
            case 6 :
                pickNumber = 1;break;
        }
         this.session.setSessionValue('itemPicked','PICK '+pickNumber);
    }
};

const mainMenuPreAction = new UssdAction('mainMenuPreAction',mainMenu.uniqueId,'javascript','pre',appId);
mainMenuPreAction.actionCode = function () {
    console.log('actionFactory mainMenuPreAction');
    let drawEvent = this.memDb.getObject('drawEvent');
    if(drawEvent){
        let drawNo = drawEvent.drawNo;
        this.session.setSessionValue('drawNo',drawNo);
    }
};

const pick5Action = new UssdAction('pick5Action',pick5.uniqueId,'javascript','post',appId);
pick5Action.actionCode = function () {
    console.log('pick5Action Generating random numbers>>> '+JSON.stringify(this.inRequest));
     let input = this.inRequest.input;
     if(input==='1'){
         console.log('pick5Action Generating random numbers>>> '+input);
         let mainMenu = this.session.inputs['mainMenu'];
         let numbersChosen =[];
         if(!isNaN(mainMenu) && isFinite(mainMenu)){
             let numCount = 0;
             switch (parseInt(mainMenu)) {
                 case 1 :
                     numCount = 6;
                      break;
                 case 2 :
                     numCount = 5;
                      break;
                 case 3 :
                     numCount = 4;
                     break;
                 case 4 :
                     numCount = 3;
                     break;
                 case 5 :
                     numCount = 2;
                     break;
                 case 6 :
                     numCount = 1;
                     break;
             }
             for(let i=0;i<numCount;i++){
                 let n= randomNumber(1,55);
                 if(numbersChosen.indexOf(n) === -1){
                     numbersChosen.push(n);
                 }else{
                      n= randomNumber(1,55);
                     numbersChosen.push(n);
                 }
             }
         }
         if(numbersChosen.length){
             let picked = numbersChosen.join(' ');
             this.session.setSessionValue('pick5chooseNumber',picked);
         }

     }
    function randomNumber(min, max) {
        return Math.round(Math.random() * (max - min) + min);
    }
};

const pick5ChooseNumbersAction = new UssdAction('pick5chooseNumberAction',pick5ChooseNumbers.uniqueId,'javascript','pre',appId);
pick5ChooseNumbersAction.actionCode = function () {
    let mainMenu = this.session.inputs['mainMenu'];
    console.log('pick5chooseNumberAction inputs >>>'+JSON.stringify(this.session.inputs));
    switch (parseInt(mainMenu)) {
        case 1 :
            this.session.setMenuEnvVariable("enterLabel" , 'at least 6 numbers');break;
        case 2 :
            this.session.setMenuEnvVariable("enterLabel" , 'at least 5 numbers');break;
        case 3 :
            this.session.setMenuEnvVariable("enterLabel" , 'at least 4 numbers');break;
        case 4 :
            this.session.setMenuEnvVariable("enterLabel" , 'at least 3 numbers');break;
        case 5 :
            this.session.setMenuEnvVariable("enterLabel" , 'at least 2 numbers');break;
        case 6 :
            this.session.setMenuEnvVariable("enterLabel" , 'at least 1 numbers');break;
    }
};


const finishPostGameAction =  new UssdAction('finishAction',finish.uniqueId,'dbaccess','pre',appId);
finishPostGameAction.actionCode = function (){
    let inputs =this.session.inputs;
    inputs.mobile = this.session.mobile;
    inputs.network = this.session.network;
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


mainMenuAction.save();
mainMenuPreAction.save();
pick5Action.save();
pick5ChooseNumbersAction.save();
finishPostGameAction.save();