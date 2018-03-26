const EthereumTx = require('ethereumjs-tx');
const utils = require('./lib/utils.js');
var SolidityFunction = require('web3/lib/web3/function');
var wallet = require('ethereumjs-wallet');
var fs = require('fs');
var Web3 = require('web3');
var web3;

var JsethContract = function(abi, address, contract, instance){
  var contractFunctionEncode = function(_functionName,_params){
    var nameMethod = '[encodeFunctionCall]';
    log.debug(`${nameModule} ${nameMethod} Encoding call function ${JSON.stringify(_functionName)} ->  with params -> ${JSON.stringify(functionParams)}`);
    var solidityFunction = new SolidityFunction('', _.find(abi, {name: _functionName}), address);
    return solidityFunction.toPayload(functionParams).data;
  };
  var listFunctions = function(){
    let index = 0;
    var list={};
    abi.forEach((foo)=>{
      list[foo.name] = index;
      index++;
    });
    return list;
  };
  this.abi = abi;
  this.address = address;
  this.instance = instance;
  this.contract = contract;
  this.listFunctions = listFunctions();
  this.contractFunctionEncode = contractFunctionEncode;
}

var JsethAccount = function(address){
  var unlock = function(password = ''){
    web3.personal.unlockAccount(address, password, 1000);
  };
  this.address = address;
  this.unlock = unlock;
  this.private = '';
  this.public = '';
}

var checkWeb3Instance = function () {
  if(web3 == undefined){
    console.log('EASYWEB3 WARNING: Web3 instance is undefined, please specify it with the correct function or add it as a parameter in this one');
    return false;
  }
  else {
    console.log('Everything ok');
    return true;
  };
}

exports.version = 'version 0.2';

exports.setProvider = function (host = "http://localhost:8545"){
  web3 = new Web3(new Web3.providers.HttpProvider(host));
  web3.eth.defaultAccount = web3.eth.accounts[0];
}

exports.setDefaultAccount = function (account){
  web3.eth.defaultAccount = account;
}

exports.getWeb3Instance = function (){
  if(checkWeb3Instance()){
  return web3;
  } else {
  return new Error('Web 3 not defined');
  }
}

exports.getAddress = function(contrato){
    let address;
    if (address == undefined || /0x([a-z0-9]{40,})$/.test(address)){
      console.log('ERROR: contract address not found');
    } else {
      address = contrato.networks[web3.version.network].address;
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

exports.jsethContractFromTruffle = function(_truffleBuild, callback){
  var version = web3.version.network;
  if (typeof _truffleBuild == 'string'){
    truffleBuild = JSON.parse(fs.readFileSync(_truffleBuild, 'utf8'));
  } else if (typeof _truffleBuild == 'object'){
    truffleBuild = _truffleBuild;
  } else {
    callback(new Error('Error: Unknown truffle source'), null);
  }
  if (truffleBuild.networks[web3.version.network] == undefined){
    callback(new Error('Error: contract address not found, contract maybe not deployed'), null);
  } else {
    if(!/0x([a-z0-9]{40,})$/.test(truffleBuild.networks[version].address)){
      callback(new Error('Error: Invalid address ' + truffleBuild.networks[version].addres), null);
    } else {
      let address = truffleBuild.networks[version].address;
      let abi = truffleBuild.abi;
      let contract = web3.eth.contract(abi);
      let instance = contract.at(address);
      callback(null, new JsethContract(abi, address, contract, instance));
    }
  }
}

exports.jsethAccountGenerate = function(){
  var _account = wallet.generate();
  address = '0x' + _account.getAddress().toString('hex');
  var account = new JsethAccount(address);
  account.private = _account._privKey;
  account.public = _account._pubKey;
  return account;
}

exports.jsethAccountGet = function(address){
  var account = new JsethAccount;
  account.address = address;
  account.private = 'on node account';
  account.public = 'on node account';
  return account;
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

exports.encodePayload = function(abiFoo, args, callback){
  if(abiFoo.inputs.length != args.length){
    callback(new Error('Error: mismatch inputs'), null);
  } else {
    let encodedPayload = '';
    let fooSign = abiFoo.name + '(';
    if (abiFoo.inputs.length != 0) {
      abiFoo.inputs.forEach((input) => {
        fooSign = fooSign + input.type +',';
      });
      fooSign = fooSign.slice(0,fooSign.length - 1);
    }
    fooSign = fooSign + ')';
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

exports.signTransaction = function(nonce, gasPrice, gasLimit, to, value, data, chainId, privateKey) {
  var nameMethod = '[signTransaction]';
  log.debug(`${nameModule} ${nameMethod} Signning transaction`);
  var tx = new EthereumTx(null, chainId);
  tx.nonce = web3.toHex(nonce);
  tx.gasPrice = web3.toHex(gasPrice);
  tx.gasLimit = web3.toHex(gasLimit);
  tx.value = web3.toHex(value);
  // for creating new contract, parameter to is Nil
  if (to != null){
    tx.to = to;
  }
  tx.data = data;
  var privateKeyBuffer = new Buffer(privateKey, 'hex');
  tx.sign(privateKeyBuffer);
  log.debug(`${nameModule} ${nameMethod} Signned transaction`);
  return '0x' + tx.serialize().toString('hex');
}

exports.signOffTransaction = function(nonce, gasPrice, gasLimit, to, value, data, chainId, privateKey) {
  var nameMethod = '[signTransaction]';
  log.debug(`${nameModule} ${nameMethod} Signning transaction`);
  var tx = new EthereumTx(null, chainId);
  tx.nonce = utils.toHex(nonce);
  tx.gasPrice = utils.toHex(gasPrice);
  tx.gasLimit = utils.toHex(gasLimit);
  tx.value = utils.toHex(value);
  // for creating new contract, parameter to is Nil
  if (to != null){
    tx.to = to;
  }
  tx.data = data;
  var privateKeyBuffer = new Buffer(privateKey, 'hex');
  tx.sign(privateKeyBuffer);
  log.debug(`${nameModule} ${nameMethod} Signned transaction`);
  return '0x' + tx.serialize().toString('hex');
}
