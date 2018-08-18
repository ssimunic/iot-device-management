const request = require('request');
const { hashPersonalMessage, ecsign, ecrecover, toRpcSig, fromRpcSig, keccak256, addHexPrefix, sha3 } = require('ethereumjs-util');
const { default: MerkleTree } = require('merkle-tree-solidity');

// Configuration file downloaded after registering device
const deviceConfig = require('./config.json');

const hashMessage = message => hashPersonalMessage(Buffer.from(message));

const signMessage = (message, privateKey) => {
  let messageHash = hashMessage(message);
  //console.log('Message hash: ' + messageHash.toString('hex'));
  let { v, r, s } = ecsign(messageHash, privateKey);
  let rpcSignature = toRpcSig(v, r, s);
  //console.log('Message signature: ' + rpcSignature);
  return rpcSignature;
}

const validateSignature = (messageHash, signature, publicKey, address) => {
  signature = fromRpcSig(signature);
  let recoveredPublicKey = ecrecover(messageHash, signature.v, signature.r, signature.s);
  let recoveredPublicKeyHex = recoveredPublicKey.toString('hex');
  let recoveredAddress = addHexPrefix(keccak256(recoveredPublicKey).toString('hex').substring(64 - 40));
  //console.log('Recovered public key: ' + recoveredPublicKeyHex);
  //console.log('Recovered address: ' + recoveredAddress);
  if (recoveredPublicKeyHex === publicKey && recoveredAddress === address) return true;
  return false;
}

// Gather data and sign
const privateKey = Buffer.from(deviceConfig.privateKey, 'hex');

let message = 'test';
let signature = signMessage(message, privateKey);

// Validate signature
if (!validateSignature(hashMessage(message), signature, deviceConfig.publicKey, deviceConfig.address)) {
  process.exit();
}

const metadataHashes = deviceConfig.metadata.map(el => sha3(el));
const merkleTree = new MerkleTree(metadataHashes);

const elementToSend = 0;
let proof = merkleTree.getProof(metadataHashes[elementToSend]);
proof = proof.map(el => addHexPrefix(el.toString('hex')));

// Build payload
let payload = {
  deviceId: deviceConfig.deviceId,
  message,
  signature: signature,
  metadata: deviceConfig.metadata[elementToSend],
  proof
}

// Send to platform
const platformEndpoint = 'http://localhost:1337/receive'
request.post({ url: platformEndpoint, json: payload }, function (error, response, body) {
  if (!error) {
    console.log(body)
  } else {
    console.log(error);
  }
})
