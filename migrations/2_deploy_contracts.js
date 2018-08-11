var DeviceManager = artifacts.require("./DeviceManager.sol");

module.exports = function(deployer) {
  deployer.deploy(DeviceManager);
};
