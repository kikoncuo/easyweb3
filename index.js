var Web3 = require('web3');
var web3;

exports.version = 'version 0.2';

exports.setProvider = function (host = "http://localhost:8545"){
  web3 = new Web3(new Web3.providers.HttpProvider(host));
  web3.eth.defaultAccount = web3.eth.accounts[0];
}

exports.setDefaultAccount = function (account){
  web3.eth.defaultAccount = account;
}

exports.getAddress = function(contrato) {
    let address;
    if (address == undefined || /0x([a-z0-9]{40,})$/.test(address)){
      console.log('ERROR: contract address not found');
    } else {
      address = truffleBuild.networks[web3.version.network].address;
    }
}

exports.getContractInstance = function (abi, address, web3Instance){
  if(web3Instance != undefined){
    web3 = web3Instance;
  }else{
    checkWeb3Instance();
  }
  var contract = web3.eth.contract(abi);
  contractInstance = contract.at(address);
  return contractInstance;
}

exports.blkListenAllEventsWithFilter = function(contractInstance, callback, filterParam, filterValue){
  var events = contractInstance.allEvents([{filterParam: filterValue}]);
  events.watch(function(error, event){
      if (error) {
        callback(error, null);
      } else {
         var eventRet = event;
        callback(null, eventRet);
      }
  });
}

exports.blkListenAllEventsContinuously = function(contractInstance, callback){
  var events = contractInstance.allEvents();
  events.watch(function(error, event){
      if (error) {
        callback(error, null);
      } else {
         var eventRet = event;
        callback(null, eventRet);
      }
  });
}

exports.blkListenAllEventsOnce = function(contractInstance, callback){
  var events = contractInstance.allEvents();
  events.watch(function(error, event){
    if (error) {
      callback(error, null);
    } else {
       var eventRet = event;
      callback(null, eventRet);
      events.stopWatching();
      }
  });
}

exports.printEventLog = function(instanceEvent){
    var myEvent = instanceEvent({},{fromBlock: 0, toBlock: "latest"});
    var eventLog = '';
    myEvent.get(function(error, logs){
      if(error) {
        console.log(error);
      } else {
        logs.forEach(function(element){
          console.log(element.args);
        });
      }
    });
  }

var checkWeb3Instance = function (){
  if(web3 == undefined){
    console.log('EASYWEB3 WARNING: Web3 instance is undefined, please specify it with the correct function or add it as a parameter in this one');
  }
  else {
    console.log('Everything ok');
  }
}

var JsethContract = function(abi, address, contract, instance){
  this.abi = abi;
  this.address = address;
  this.instance = instance;
  this.contract = contract;
  var listFunctions = function(){
    let index = 0;
    var list = [];
    abi.forEach((foo)=>{
      let item = {};
      item.name = foo.name;
      item.index = index;
      list[index] = item;
      index ++;
    });
    return list;
  }
  this.listFunctions = listFunctions();
}

exports.JsethContractFromTruffle = function(truffleBuild, callback){
  if (truffleBuild.networks[web3.version.network] == undefined){
    console.log('******************\nERROR: contract address not found, contract maybe not deployed\n******************');
    var error = 'error truffle object'
    callback(error, null);
  } else {
    if(!/0x([a-z0-9]{40,})$/.test(truffleBuild.networks[web3.version.network].address)){
      console.log('ERROR: Invalid address ' + truffleBuild.networks[web3.version.network].address);
      var error = 'error address';
      callback(error, null);
    } else {
      let address = truffleBuild.networks[web3.version.network].address;
      let abi = truffleBuild.abi;
      let contract = web3.eth.contract(abi);
      let instance = contract.at(address);
      callback(null, new JsethContract(abi, address, contract, instance));
    }
  }
}

exports.encodePayload = function(abiFoo, args, callback){
  if(abiFoo.inputs.length != args.length){
    callback('error: mismatch inputs', null);
  } else {
    let encodedPayload = '';
    let fooSign = abiFoo.name + '(';
    abiFoo.inputs.forEach((input) => {
      fooSign = fooSign + input.type +',';
    });
    fooSign = fooSign.slice(0,fooSign.length - 1) + ')';
    fooSign = web3.sha3(fooSign).slice(0,10);
    if(abiFoo.inputs.length == 0){
      encodedPayload = fooSign +'0'.repeat(56);
    } else {
      encodedPayload = fooSign;
      args.forEach((arg)=>{
        encodedPayload = encodedPayload + '0'.repeat(66 - web3.toHex(arg).length) + web3.toHex(arg).slice(2, web3.toHex(arg).length);
      });
    }
    callback(null, encodedPayload);
  }
}
