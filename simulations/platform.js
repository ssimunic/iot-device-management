const express = require('express');
const app = express();
const Web3 = require('web3');
const { hashPersonalMessage, addHexPrefix, sha3 } = require('ethereumjs-util');

const hashMessageHex = message => addHexPrefix(hashPersonalMessage(Buffer.from(message)).toString('hex'));

app.use(express.json());

const DeviceManagerArtifact = require('../build/contracts/DeviceManager.json');
let latestNetwork = DeviceManagerArtifact.networks[Object.keys(DeviceManagerArtifact.networks).reduce((res, curr) => curr > res ? curr : res)];

// Connect to local node
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
web3.eth.defaultAccount = web3.eth.accounts[0];

// Instance using ABI and contract address
const deviceManager = web3.eth.contract(DeviceManagerArtifact.abi).at(latestNetwork.address);

// Receive payload and validate on blockchain
app.post('/receive', function (req, res) {
  console.log('received payload: ' + JSON.stringify(req.body));

  // Validate message
  const { deviceId, message, signature } = req.body;
  let validMessage = deviceManager.isValidEthMessage(deviceId, hashMessageHex(message), signature);
  console.log('valid message: ' + validMessage);

  // Validate metadata
  const { metadata, proof } = req.body;
  let metadataHash = addHexPrefix(sha3(metadata).toString('hex'));
  let validMetadata = deviceManager.isValidMetadataMember(deviceId, proof, metadataHash);
  console.log('valid metadata: ' + validMetadata);

  // Validate firmware
  const { firmware } = req.body;
  let firmwareHash = addHexPrefix(sha3(firmware).toString('hex'));
  let validFirmware = deviceManager.isValidFirmwareHash(deviceId, firmwareHash);
  console.log('valid firmware: ' + validFirmware);

  // Respond back with status
  res.send({
    validMessage,
    validMetadata,
    validFirmware
  });
})

app.listen(1337, () => console.log('Platform simulation listening on port 1337'));
