var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));//with testrpc
web3.eth.defaultAccount = web3.eth.accounts[0];

exports.setProvider = function (web3Instance){
  web3 = web3Instance;
}

exports.setAccount = function (account){
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
