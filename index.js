const EthereumTx = require('ethereumjs-tx')
const Web3 = require('web3');
var SolidityFunction = require('web3/lib/web3/function');
var web3; //with testrpc

exports.setProvider = function (web3Instance){
  web3 = web3Instance;
}

exports.encodeFunctionCall = function (abi, functionName, functionParams, contractAddress) {
  var nameMethod = '[encodeFunctionCall]';
  console.log("%s %s Encoding call function %s -> with params -> ", nameModule, nameMethod, JSON.stringify(functionName), JSON.stringify(functionParams));
  var solidityFunction = new SolidityFunction('', _.find(abi, {name: functionName}), contractAddress);
  return solidityFunction.toPayload(functionParams).data;
}

exports.signTransaction = function (nonce, gasPrice, gasLimit, to, value, data, chainId, privateKey) {
  var nameMethod = '[signTransaction]';
  console.log("%s %s Signing transaction", nameModule, nameMethod);
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
  console.log("%s %s Signed transaction", nameModule, nameMethod);
  return '0x' + tx.serialize().toString('hex');
}

exports.setOtherAccount = function (){
  return web3.eth.accounts[1];
}

exports.setAccount = function (account){
  web3.eth.defaultAccount = account;
}

exports.setDefaultAccount = function (account){
  web3.eth.defaultAccount = account;
}

exports.getLatestAddress = function(contrato) {
    for(var k in contrato.networks) {
      if (contrato.networks[k].updated_at == contrato.updated_at){
        return contrato.networks[k].address
      }
    }
    console.log('ERROR: contract address not found');
}

exports.getContractInstance = function (abi, address){
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
