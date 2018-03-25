
# EASY WEB 3

 Package that simplifies the use of web3:

## Avaiable functions:

 ```
setProvider (host): init the web3 instance and everything needed

setDefaultAccount (account): change the deffault account

getWeb3Instance (): check web3 instance up

getAddress (contrato): return the address from a truffle contract object

getContractInstance (abi, address, web3Instance): return a javascript instance of the contract at address

blkListenAllEventsWithFilter (contractInstance, callback, filterParam, filterValue): Get all the event instances in the blockchain

blkListenAllEventsContinuously (contractInstance, callback): Listen to event instances continuously

blkListenAllEventsOnce (contractInstance, callback):

jsethContractFromTruffle (_truffleBuild, callback): returns a jseth contract object from a truffle build json

jsethAccountGenerate (): generate an account object to use in ethereum

jsethAccountGet (address): instance an account object from a known account

printEventLog (instanceEvent)

encodePayload (abiFoo, args, callback): encode a paload to a bytes array to use in forwarded transactions

signTransaction (nonce, gasPrice, gasLimit, to, value, data, chainId, privateKey): sign a transaction out of the node. data can be get from the contract jseth object encode method

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

 SCController.blkListenAllEventsWithFilter(contractInstance, eventHandler, 'countryCode', 351);
 ```
