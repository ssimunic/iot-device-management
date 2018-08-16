#!/bin/bash

truffle compile && truffle migrate --reset && cp build/contracts/DeviceManager.json frontend/src/artifacts/DeviceManager.json