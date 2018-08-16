import getWeb3 from '../utils/web3';
import DeviceManager, { getDefaultAccount } from '../DeviceManager';
import { addHexPrefix } from 'ethereumjs-util';

import React, { Component } from 'react';
import { Button, Input, Alert, Divider, Spin, Icon, notification, message } from 'antd';

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message,
    description
  });
};

class ManageDevice extends Component {
  constructor(props) {
    super(props);

    this.state = {
      deviceId: this.props.match.params.deviceId,
      loading: true,
      showEditIdentifier: false,
      showEditMetadata: false,
      showEditFirmware: false
    }

    this.commonChange = this.commonChange.bind(this);
    this.watchForChanges = this.watchForChanges.bind(this);
    this.updateDeviceData = this.updateDeviceData.bind(this);
  }

  async componentWillMount() {
    try {
      let web3 = (await getWeb3).web3;
      let instance = await DeviceManager;

      this.setState({
        web3,
        instance
      });

      this.updateDeviceData();
    } catch (error) {
      console.log(error);
      message.error(error.message);
    }
  }

  async updateDeviceData() {
    const { instance } = this.state;

    let device = await instance.devices(this.state.deviceId);

    this.setState({
      owner: device[0],
      identifier: device[1],
      metadataHash: device[2],
      firmwareHash: device[3],
      loading: false
    })

    let { identifier, metadataHash, firmwareHash } = this.state;
    this.setState({
      identifierNew: identifier,
      metadataHashNew: metadataHash,
      firmwareHashNew: firmwareHash
    })
  }

  toggleEdit(property) {
    const { showEditFirmware, showEditIdentifier, showEditMetadata } = this.state;

    switch (property) {
      case 'identifier':
        this.setState({
          showEditIdentifier: !showEditIdentifier
        })
        break;
      case 'metadata':
        this.setState({
          showEditMetadata: !showEditMetadata
        })
        break;
      case 'firmware':
        this.setState({
          showEditFirmware: !showEditFirmware
        })
        break;
      default:
    }
  }

  watchForChanges(property) {
    let filter = this.state.web3.eth.filter('latest', (error, result) => {
      if (!error) {
        openNotificationWithIcon('success', 'Transaction mined', `Property ${property} has been updated.`);
        this.state.filter.stopWatching();
        this.updateDeviceData();
      } else {
        console.error(error);
      }
    });

    this.setState({
      filter
    })
  }

  async saveData(property) {
    const { instance, deviceId, identifier, identifierNew, metadataHash, metadataHashNew, firmwareHash, firmwareHashNew } = this.state;

    try {
      switch (property) {
        case 'identifier':
          if (identifier !== identifierNew) {
            await instance.updateIdentifier(deviceId, addHexPrefix(identifierNew), { from: getDefaultAccount() });
            this.watchForChanges(property);
            openNotificationWithIcon('info', 'Transaction sent', 'Once mined, identifier for this device will be updated.');
            this.setState({
              loading: true,
            });
          }
          break;
        case 'metadata':
          if (metadataHash !== metadataHashNew) {
            await instance.updateMetadataHash(deviceId, addHexPrefix(metadataHashNew), { from: getDefaultAccount() });
            this.watchForChanges(property + ' hash');
            openNotificationWithIcon('info', 'Transaction sent', 'Once mined, metadata hash for this device will be updated.');
            this.setState({
              loading: true,
            });
          }
          break;
        case 'firmware':
          if (firmwareHash !== firmwareHashNew) {
            await instance.updateFirmwareHash(deviceId, addHexPrefix(firmwareHashNew), { from: getDefaultAccount() });
            this.watchForChanges(property + ' hash');
            openNotificationWithIcon('info', 'Transaction sent', 'Once mined, firmware hash for this device will be updated.');
            this.setState({
              loading: true,
            });
          }
          break;
        default:
      }

      this.toggleEdit(property);
    } catch (error) {
      console.log(error);
      message.error(error.message);
      this.toggleEdit(property);
    }

  }

  commonChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  render() {
    const { loading, owner, identifier, metadataHash, firmwareHash, showEditFirmware, showEditIdentifier, showEditMetadata } = this.state;

    let identifierContent = () => {
      if (showEditIdentifier) {
        return (
          <div>
            <Input name="identifierNew" value={this.state.identifierNew} onChange={this.commonChange} maxLength="66" />
            <Button type="primary" style={{ marginTop: '10px' }} onClick={() => this.saveData('identifier')}>Save</Button>
          </div>
        )
      }
      return (
        <div>
          Identifier {identifier}&nbsp;
          <a><Icon type="edit" onClick={() => this.toggleEdit('identifier')} /></a>
        </div>
      )
    }

    let metadataContent = () => {
      if (showEditMetadata) {
        return (
          <div>
            <Input name="metadataHashNew" value={this.state.metadataHashNew} onChange={this.commonChange} maxLength="66" />
            <Button type="primary" style={{ marginTop: '10px' }} onClick={() => this.saveData('metadata')}>Save</Button>
          </div>
        )
      }
      return (
        <div>
          Metadata hash {metadataHash.length > 0 ? metadataHash : 'empty'}&nbsp;
          <a><Icon type="edit" onClick={() => this.toggleEdit('metadata')} /></a>
        </div>
      )
    }

    let firmwareContent = () => {
      if (showEditFirmware) {
        return (
          <div>
            <Input name="firmwareHashNew" value={this.state.firmwareHashNew} onChange={this.commonChange} maxLength="66" />
            <Button type="primary" style={{ marginTop: '10px' }} onClick={() => this.saveData('firmware')}>Save</Button>
          </div>
        )
      }
      return (
        <div>
          Firmware hash {firmwareHash.length > 0 ? firmwareHash : 'empty'}&nbsp;
          <a><Icon type="edit" onClick={() => this.toggleEdit('firmware')} /></a>
        </div>
      )
    }

    return (
      <div>
        <Spin spinning={loading} className="loading-spin">
          {loading === false && owner === getDefaultAccount() &&
            <div>
              <h3><div style={{ marginBottom: '20px' }}>{identifierContent()}</div></h3>
              <Divider />
              <div style={{ marginBottom: '20px' }}>{metadataContent()}</div>
              <div style={{ marginBottom: '20px' }}>{firmwareContent()}</div>
            </div>
          }
          {loading === false && owner !== getDefaultAccount() &&
            <Alert message="You don't own this device." type="error" showIcon />
          }
        </Spin >
      </div>
    );
  }
}

export default ManageDevice;