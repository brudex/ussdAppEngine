var resthandler = require('./resthandler');
const crypto = require('crypto');

function generateSessionId(){
    return generateTransId();
}

function getCurrentDateTime(){
  return new Date();
}

function formatDate(date){
    var mm = date.getMonth() + 1;
    var dd = date.getDate();
    return [date.getFullYear(), !mm[1] && '0', mm, !dd[1] && '0', dd].join('');
}

function timeStamp(dayOnly){
    var date = new Date();
    var mm =  (date.getMonth() + 1) >= 10? ''+(date.getMonth() + 1):'0'+(date.getMonth() + 1);
    var dd = date.getDate();
    if(dayOnly){
        return [date.getFullYear(), mm, dd].join('');
    }
    var hh =  date.getHours() > 10? ''+date.getHours():''+date.getHours();
    var min = date.getMinutes() > 10? ''+date.getMinutes():''+date.getMinutes();
    var ss = date.getSeconds() > 10? ''+date.getSeconds():''+date.getSeconds();
    return [date.getFullYear(), mm, dd, hh, min, ss].join('');
}

function toTimeStamp(date,dayOnly){
    var mm =  (date.getMonth() + 1) >= 10? ''+(date.getMonth() + 1):'0'+(date.getMonth() + 1);
    var dd = date.getDate();
    if(dayOnly){
        return [date.getFullYear(), mm, dd].join('');
    }
    var hh =  date.getHours() > 10? ''+date.getHours():''+date.getHours();
    var min = date.getMinutes() > 10? ''+date.getMinutes():''+date.getMinutes();
    var ss = date.getSeconds() > 10? ''+date.getSeconds():''+date.getSeconds();
    return [date.getFullYear(), mm, dd, hh, min, ss].join('');
}



function generateTransId(){
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + s4() + s4() +
        s4() + s4() + s4() + s4();
}

function getRandomReference(){
    var date = new Date();
    var components = [
        date.getYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds()
    ];
    
    return components.join("")  +randomInt(5);
}

function removeInvalidIUssdCharacters(text){
    let resultText='';
    resultText =  text.replace(/\%/g,'');
    resultText =  resultText.replace(/&/g,' and ');
    resultText =  resultText.replace(/'/g,'');
    resultText =  resultText.replace(/\//g,' ');
    resultText =  resultText.replace(/\$/g,'');
    return resultText;
}

function getDayOfWeek(){
    var d = new Date();
    var n = d.getDay();
    return n;
}

function randomInt(string_length) {
	var chars = "0123456789";
	var randomstring = '';
	for (var i=0; i<string_length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum,rnum+1);
	}
	return randomstring;
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function getSha1(text){
 const  shasum = crypto.createHash('sha1');
 shasum.update(text);
 return shasum.digest('hex');
}

module.exports = {
    getNewSessionId: generateSessionId,
    getCurrentDateTime: getCurrentDateTime,
    generateTransId: generateTransId,
    restHandler :resthandler,
    isNumeric : isNumeric,
    getSha1 : getSha1,
    getRandomReference :getRandomReference,
    timeStamp:timeStamp,
    getDayOfWeek:getDayOfWeek,
    toTimeStamp,
    removeInvalidIUssdCharacters

};