# IoT Device Management

## Introduction

A system that leverages Ethereum platform for identity, authentication and reputation of IoT devices. Devices are registered in a smart contract via a web interface and send cryptographically signed messages to a platform that validates them using blockchain.

This project is a part of my undergraduate thesis [Using blockchain for registration and control of IoT devices
](https://zir.nsk.hr/en/islandora/object/riteh:1085).

### Abstract
> IoT is facing identity, security and interoperability problem. Current systems rely on centralized client-server model that will soon be unsatisfactory due to the rapid increase in the number of devices connected to the Internet. Blockchain is shared, distributed and decentralized ledger that allows development of decentralized applications. This thesis examines the concept of its use for registration and management of IoT devices. A system that consists of a smart contract, web interface, and device and platform has been developed. Systems users, entities, register devices within a smart contract with their control information via a web interface. Devices sign messages using private key which are sent to the platform along with control information and associated proof. Received messages are validated using blockchain, which at the end provides authentication, integrity and non-repudiation.

## Concept

Below are presented four main concepts that apply to this system.

### Device Identity
Device is registered without revealing it's private properties by using Merkle tree. Public key or it's representation is used as an ID. 

#### Example of properties being hashed into Merkle root
<img src="https://i.imgur.com/mt2TiQe.png" width="700">

### Message Authentication
Each message is signed and validated using blockchain on receiver's end.

#### Generating signature
<img src="https://i.imgur.com/3TTQcqZ.png" width="700">

#### Validation
<img src="https://i.imgur.com/5NpKIkW.png" width="700">

### Firmware Hashing
It is possible to confirm that device is running valid firmware that hasn't been tampered with.

### Device Reputation
Based on Web of Trust principle, devices can form a network of trust. The more signatures a device has from other reputable devices, the more trusted it can be.

## Architecture

Consists of entities, devices and an IoT platform. 

<img src="https://i.imgur.com/91p9lkX.png" width="700">

### Development

Technologies used are as follows:

* Ethereum
* Solidity
* Truffle Framework
* Web3.js
* React

## Structure

Main folders and their content:

* **contracts** - Smart contracts (Solidity)
* **frontend** - Web interface (React)
* **simulations** - Device and platform simulations

## Smart Contract

See file `contracts/DeviceManager.sol` for full list and explanations of methods and events.

## Web Interface

### Home and network status
![](https://i.imgur.com/8iPc2JF.png)

### Historical events for entity
![](https://i.imgur.com/snKZ5ze.png)

### Device registration

#### Identifier
![](https://i.imgur.com/9S4BLlF.png)

#### Metadata
![](https://i.imgur.com/eF1kStT.png)

#### Firmware
![](https://i.imgur.com/oUrcIXI.png)

#### Confirm
![](https://i.imgur.com/gmDYehL.png)

#### Download configuration
![](https://i.imgur.com/Yvdlslq.png)

### List devices
![](https://i.imgur.com/YDNMddz.png)

### Edit device
![](https://i.imgur.com/ga5Sy0C.png)

### Historical events for device
![](https://i.imgur.com/jvIeEW6.png)

## Devices and platform

Example device configuration.

```js
{
    "identifier": "0xf34d4c8f79657f1086f55b817837439c303dff19",
    "metadataHash": "43af4ba721cd8c9ba432ed6aca9adb96d16f82c25ba76...",
    "firmwareHash": "b01d2af9ea9dd59dd9c8af3f1639da03c79b7ed28adaa...",
    "metadata": [
        "Olive grove",
        "45.0270,14.61685",
        "Espressif Systems",
        "00:0a:95:9d:68:16"
    ],
    "firmware": "333f14cdb0a8520199257479ba126a10bca96b229b7924085...",
    "address": "0xf34d4c8f79657f1086f55b817837439c303dff19",
    "publicKey": "d627bbb0a7c150f814a1960ebe69f0d8b4494e1033d9e72...",
    "privateKey": "48a2e48b2d178e7d1f1508f2964a89079f1f8a301ebb85a...",
    "curve": "secp256k1",
    "deviceId": 0
}
```

Simulation example for device and platform can be found in files `simulations/device.js` and `simulations/platform.js`.
