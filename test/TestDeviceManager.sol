pragma solidity ^0.4.24;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/DeviceManager.sol";

contract TestDeviceManager {
    DeviceManager deviceManager = DeviceManager(DeployedAddresses.DeviceManager());
    uint constant createdDeviceId = 0;

    function testCreateDevice() public {
        uint deviceId = deviceManager.createDevice(
            sha256("identifier"),
            sha256("metadata"),
            sha256("firmware")
        );

        Assert.equal(deviceId, createdDeviceId, "New device should be recorded with ID of 0.");
    }

    function testCreatedDeviceOwner() public {
        address owner;
        (owner,,,) = deviceManager.devices(createdDeviceId); 

        Assert.equal(owner, this, "Created device should be recorded and owned by this address");
    }

    function testGetDevicesByOwner() public {
        uint[] memory deviceIds = deviceManager.getDevicesByOwner(this);
        uint[] memory expectedIds = new uint[](1);
        expectedIds[0] = 0;

        Assert.equal(
            keccak256(abi.encodePacked(deviceIds)), 
            keccak256(abi.encodePacked(expectedIds)), 
            "Only one device should have been created owned by this address"
        );
    }
}
