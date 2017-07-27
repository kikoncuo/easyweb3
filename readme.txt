
# EASY WEB 3
 
 Package that simplifies the use of web3:
 
## Avaiable functions:
 
 ```
 setProvider(web3Instance) (Default provider is testrpc)
 
 setAccount(web3Account)  (Default account is web3.eth.accounts[0])
 
 getLatestAddress = function(contract) 
 
 getContractInstance(abi, address)
 
 blkListenAllEventsContinuously(contractInstance, callback)
 
 blkListenAllEventsOnce(contractInstance, callback)
 
 printEventLog = function(instanceEvent)
 ```
 
 
##Examples:
 
 ```
 var SCController = require('easyweb3');
 
 var AccountAddress = SCController.getLatestAddress(abiAccount);
 
 var contractInstance = SCController.getContractInstance(jsonFile.abi, addressWhereWasDeployed);
 
 contractInstance.smartContractFunc(exampleParameter);
 
 SCController.blkListenAllEventsContinuously(contractInstance, eventHandler);
 
   function eventHandler (error, eventRet) {
 
     if (error != null) console.error('Error!', error)
 
     else console.log(eventRet.event  ": "  JSON.stringify(eventRet.args))
   }
 
 SCController.printEventLog(instanceAccountIdContract.allEvents);
 ```