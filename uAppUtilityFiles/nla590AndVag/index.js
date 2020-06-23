



function computeSubTypeBetType(gameData) {
    var directOption = parseInt(gameData.directOption);
    let subType, betType;
    switch (directOption) {
        case 1:
            subType = "Q1";
            betType = "DS";
            break;
        case 2:
            subType = "RX2";
            betType = "DS";
            break;
        case 3:
            subType = "RX3";
            betType = "DS";
            break;
        case 4:
            subType = "RX4";
            betType = "DS";
            break;
        case 5:
            subType = "RX5";
            betType = "DS";
            break;
        case 6:
            subType = "RX2";
            betType = "FS";
            break;
        case 7:
            subType = "RX3";
            betType = "FS";
            break;
        case 8:
            subType = "RX4";
            betType = "FS";
            break;
        case 9:
            subType = "RX5";
            betType = "FS";
            break;
        case 10:
            subType = "RX2";
            betType = "DT";
            break;
    }
    var stakeNos = gameData.numberToPlay.split(' ');
    var codeStr = stakeNos.join('+');
    if(gameData.gameOption==='1'){
        codeStr = "H-" + codeStr;
        if (gameData.machineOption === "1") {
            codeStr = "H-" + codeStr;
        }
        if (gameData.machineOption === "2") {
            codeStr = "T-" + codeStr;
        }
    }

    const stakeAmount = Number(gameData.betAmount);
    return { stakeNos, codeStr, stakeAmount, subType, betType };
}


function calculateBetCount(codeStr,subType,betType,betAmount){
    let totalAmount =0;
    let betCount =0;
    let betNumber = 1;
    let betTimes = 0;
    if(subType=="Q1" && betType=="DS"){	//"Direct 1"
        codeStr.length = 1;	//Players can only choose 1 number
        betTimes = betAmount/0.01;
        betNumber = 1;
        totalAmount = betAmount*betNumber;
        betCount = totalAmount/0.01;
    }else if(subType=="Q1" && betType=="FS"){	//"Perm 1"
        codeStr.length > 1;	//Players can choose 2 numbers or more
        betNumber = codeStr.length;
        betTimes = betAmount/0.01;
        totalAmout = betAmount * betNumber;
        betCount = totalAmount/0.01;
    }else if(subType=="RX2" && betType=="DS"){  //Direct 2
        codeStr.length = 2;	//Players can only choose 2 numbers
        betTimes = betAmount/0.01;
        betNumber = 1;
        totalAmount = betAmount*betNumber;
        betCount = totalAmount/0.01;
    }else if(subType=="RX2" && betType=="FS"){  //Perm 2
        var n = codeStr.length;
        n > 2;	//Players can choose 3 number2 or more
        betTimes = betAmount/0.01;
        betNumber = n*(n-1)/2;
        totalAmount = betAmount*betNumber;
        betCount = totalAmount/0.01;
    }else if(subType=="RX2" && betType=="DT"){  //Banker to Banker
        var n = codeStr.length;
        n = 1;	//Players can choose 1 number
        betTimes = betAmount/0.01;
        betNumber = 89;
        totalAmount = betAmount * betNumber;
        betCount = totalAmount/0.01;
    }else if(subType=="RX3" && betType=="DS"){  //Direct 3
        codeStr.length = 3;	//Players can only choose 3 numbers
        betTimes = betAmount/0.01;
        betNumber = 1;
        totalAmount = betAmount*betNumber;
        betCount = totalAmount/0.01;
    }else if(subType=="RX3" && betType=="FS"){  //Perm 3
        var n = codeStr.length;
        n > 3;	//Players can choose 4 numbers or more
        betTimes = betAmount/0.01;
        betNumber = n*(n-1)*(n-2)/(3*2)
        totalAmount = betAmount*betNumber;
        betCount = totalAmount/0.01;
    }else if(subType=="RX4" && betType=="DS"){  //Direct 4
        codeStr.length = 4;	//Players can only choose 4 numbers
        betTimes = betAmount/0.01;
        betNumber = 1;
        totalAmount = betAmount*betNumber;
        betCount = totalAmount/0.01;
    }else if(subType=="RX4" && betType=="FS"){  //Perm 4
        var n = codeStr.length;
        n > 4;	//Players can choose 5 numbers or more
        betTimes = betAmount/0.01;
        betNumber = n*(n-1)*(n-2)*(n-3)/(4*3*2);
        totalAmount = betAmount*betNumber;
        betCount = totalAmount/0.01;
    }else if(subType=="RX5" && betType=="DS"){  //Direct 5
        codeStr.length = 5;	//Players can only choose 5 numbers
        betTimes = betAmount/0.01;
        betNumber = 1;
        totalAmount = betAmount*betNumber;
        betCount = totalAmount/0.01;
    }else if(subType=="RX5" && betType=="FS"){  //Perm 5
        var n = codeStr.length;
        n > 5;	//Players can choose 6 numbers or more
        betTimes = betAmount/0.01;
        betNumber = n*(n-1)*(n-2)*(n-3)*(n-4)/(5*4*3*2);
        totalAmount = betAmount*betNumber;
        betCount = totalAmount/0.01;
    }
    totalAmount = totalAmount*100;
    return [totalAmount,betNumber,betTimes];
}


module.exports = {
    computeSubTypeBetType,
    calculateBetCount,
};