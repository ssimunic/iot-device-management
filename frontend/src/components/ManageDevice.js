import getWeb3 from '../utils/web3';
import DeviceManager, { getDefaultAccount } from '../DeviceManager';
import { addHexPrefix } from 'ethereumjs-util';

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Button, Input, Card, Timeline, Divider, Spin, Alert, Icon, notification, message } from 'antd';

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message,
    description
  });
};

const eventsToSave = ['DeviceCreated', 'DevicePropertyUpdated', 'DeviceTransfered', 'DeviceSigned', 'SignatureRevoked'];

class ManageDevice extends Component {
  constructor(props) {
    super(props);

    this.state = {
      deviceId: this.props.match.params.deviceId,
      loading: true,
      showError: false,
      showEditIdentifier: false,
      showEditMetadata: false,
      showEditFirmware: false,
      showEditOwner: false
    }

    this.commonChange = this.commonChange.bind(this);
    this.watchForChanges = this.watchForChanges.bind(this);
    this.updateDeviceData = this.updateDeviceData.bind(this);
  }

  componentWillReceiveProps({ match }) {
    this.setState({ 
      ...this.state,
      showError: false,
      deviceId: match.params.deviceId
    }, () => this.updateDeviceData());
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
      //message.error(error.message);
      this.setState({
        loading: false,
        showError: true
      })
    }
  }

  async updateDeviceData() {
    try {
      const { instance, deviceId } = this.state;
      let device = await instance.devices(deviceId);
      let signatureCount = await instance.deviceSignatureCount(deviceId);
      let allEvents = instance.allEvents({ fromBlock: 0, toBlock: 'latest' });
      allEvents.get((error, logs) => {
        let filteredData = logs.filter(el => eventsToSave.includes(el.event) && el.args.deviceId.toNumber() === parseInt(deviceId, 10));
        if (!error) {
          this.setState({
            data: filteredData,
            loading: false,
            owner: device[0],
            identifier: device[1],
            metadataHash: device[2],
            firmwareHash: device[3],
            signatureCount: signatureCount.toNumber()
          })
        }

        let { identifier, metadataHash, firmwareHash, owner } = this.state;
        this.setState({
          identifierNew: identifier,
          metadataHashNew: metadataHash,
          firmwareHashNew: firmwareHash,
          ownerNew: owner
        })
      });
    } catch (error) {
      console.log(error);
      //message.error(error.message);
      this.setState({
        loading: false,
        showError: true
      })
    }
  }

  toggleEdit(property) {
    const { showEditFirmware, showEditIdentifier, showEditMetadata, showEditOwner } = this.state;

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
      case 'transfer':
        this.setState({
          showEditOwner: !showEditOwner
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
    const { instance, deviceId, identifier, identifierNew, metadataHash, metadataHashNew, firmwareHash, firmwareHashNew, owner, ownerNew } = this.state;

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
        case 'transfer':
          if (owner !== ownerNew) {
            await instance.transferDevice(deviceId, addHexPrefix(ownerNew), { from: getDefaultAccount() });
            this.watchForChanges('owner');
            openNotificationWithIcon('info', 'Transaction sent', 'Once mined, owner for this device will be updated.');
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
    const { web3, loading, showError, owner, identifier, metadataHash, firmwareHash,  signatureCount, showEditFirmware, showEditIdentifier, showEditMetadata, showEditOwner } = this.state;

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
          {owner === getDefaultAccount() &&
            <a><Icon type="edit" onClick={() => this.toggleEdit('identifier')} /></a>
          }
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
          {owner === getDefaultAccount() &&
            <a><Icon type="edit" onClick={() => this.toggleEdit('metadata')} /></a>
          }
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
          {owner === getDefaultAccount() &&
            <a><Icon type="edit" onClick={() => this.toggleEdit('firmware')} /></a>
          }
        </div>
      )
    }

    let transferContent = () => {
      if (showEditOwner) {
        return (
          <div>
            <Input name="ownerNew" value={this.state.ownerNew} onChange={this.commonChange} maxLength="66" />
            <Button type="primary" style={{ marginTop: '10px' }} onClick={() => this.saveData('transfer')}>Save</Button>
          </div>
        )
      }
      return (
        <div>
          {owner === getDefaultAccount() &&
            <Button type="dashed" onClick={() => this.toggleEdit('transfer')}> Transfer ownership</Button>
          }
          {owner !== getDefaultAccount() &&
            <div>
              Owned by <Link to={"/lookup-entity/" + owner}><Tag>{owner}</Tag></Link>
            </div>
          }
        </div>
      )
    }

    return (
      <div>
        <Spin spinning={loading} className="loading-spin">
          {loading === false && showError === false && typeof metadataHash !== 'undefined' &&
            <div>
              <h3><div style={{ marginBottom: '20px' }}>{identifierContent()}</div></h3>
              <Divider />
              <div style={{ marginBottom: '20px' }}>{metadataContent()}</div>
              <div style={{ marginBottom: '20px' }}>{firmwareContent()}</div>
              {transferContent()}
              <Divider />
              {signatureCount > 0 &&
              <div>
              <div>This device has <strong>{signatureCount}</strong> active signature(s). Devices that have been signed can't be updated.</div>
              <Divider />
              </div>
              }
              <Card title={'Historical events for device (oldest to newest)'}>
                {this.state.data.length !== 0 ?
                  <div>
                    <p style={{ marginBottom: '20px' }}>Events that are filtered are {eventsToSave.join(', ')} </p>
                    <Timeline style={{ marginTop: '10px' }}>
                      {this.state.data.map(el => {
                        if (el.event === 'DeviceCreated')
                          return <Timeline.Item color='green'>Device created by &nbsp;<Link to={"/lookup-entity/" + el.args.owner}><Tag>{el.args.owner}</Tag></Link>with &nbsp;<Link to={"/manage-device/" + el.args.deviceId.toNumber()}><Tag>ID {el.args.deviceId.toNumber()}</Tag></Link>, identifier <code>{el.args.identifier}</code>, metadata hash <code>{el.args.metadataHash}</code> and firmware hash <code>{el.args.firmwareHash}</code></Timeline.Item>
                        if (el.event === 'DevicePropertyUpdated')
                          return <Timeline.Item>Property {web3.toUtf8(el.args.property)} updated to <code>{el.args.newValue}</code></Timeline.Item>
                        if (el.event === 'DeviceTransfered')
                          return <Timeline.Item color='orange'>Device transfered to &nbsp;<Link to={"/lookup-entity/" + el.args.newOwner}><Tag>{el.args.newOwner}</Tag></Link></Timeline.Item>
                        if (el.event === 'DeviceSigned')
                          return <Timeline.Item color='purple'>Signature with  &nbsp;<Link to={"/check-signature/" + el.args.signatureId.toNumber()}><Tag>ID {el.args.signatureId.toNumber()}</Tag></Link>created by {el.args.signer}</Timeline.Item>  
                        if (el.event === 'SignatureRevoked')
                          return <Timeline.Item color='purple'>Signature with  &nbsp;<Link to={"/check-signature/" + el.args.signatureId.toNumber()}><Tag>ID {el.args.signatureId.toNumber()}</Tag></Link>revoked</Timeline.Item>  
                        else
                          return null
                      })}
                    </Timeline>
                  </div>
                  :
                  <p><em>empty</em></p>
                }
              </Card>
            </div>
          }
          {/*
          {loading === false && owner !== getDefaultAccount() &&
            <Alert message="You don't own this device." type="error" showIcon />
          }
          */}
          {loading === false && showError &&
            <Alert
              message="Error"
              description="Error loading device: invalid ID format or device doesn't exist."
              type="error"
              showIcon
            />
          }
        </Spin >
      </div>
    );
  }
}

export default ManageDevice;