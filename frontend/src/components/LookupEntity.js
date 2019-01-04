import DeviceManager, { getDefaultAccount } from '../DeviceManager';
import ethUtil from 'ethereumjs-util';

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Tag, Card, Input, Divider, Timeline, message } from 'antd';

const Search = Input.Search;

const eventsToSave = ['EntityDataUpdated', 'DeviceCreated', 'DeviceTransfered', 'DeviceSigned'];

class LookupEntity extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      searchValue: '',
      address: this.props.match.params.address,
      data: [],
      searched: false
    }

    this.lookupEntity = this.lookupEntity.bind(this);
  }

  componentWillMount() {
    const { address } = this.state;
    if (address != null) {
      this.reloadWithAddress(address);
    }
  }

  reloadWithAddress(address) {
    this.setState({
      searchValue: address
    })
    this.lookupEntity(address);
  }

  async lookupEntity(address) {
    if (!ethUtil.isValidAddress(address)) {
      message.error('Invalid entity address.');
      return;
    }

    this.setState({
      loading: true
    });

    try {
      let instance = await DeviceManager;

      let allEvents = instance.allEvents({ fromBlock: 0, toBlock: 'latest' });
      allEvents.get((error, logs) => {
        let filteredData = logs.filter(el => eventsToSave.includes(el.event) && (el.args.owner === address || el.args.oldOwner === address || el.args.newOwner === address || el.args.signer === address));
        if (!error) {
          this.setState({
            address: address,
            data: filteredData,
            loading: false,
            searched: true
          })
        }
      });
    } catch (error) {
      console.log(error);
      message.error(error.message);
    };
  }

  render() {
    return (
      <div>
        <p>
          Search for any entity.
        </p>
        <Search
          placeholder="Input address"
          onSearch={value => this.lookupEntity(value)}
          size="large"
          enterButton
          value={this.state.searchValue}
          onChange={(e) => this.setState({ searchValue: e.target.value })}
        />
        <br /><br />
        <Button size="small" onClick={() => this.setState({ searchValue: getDefaultAccount() })}>Set to my address</Button>
        {this.state.searched &&
          <div>
            <Divider />
            <Card loading={this.state.loading} title={'Historical events for entity (oldest to newest)'}>
              {this.state.data.length !== 0 ?
                <div>
                  <p style={{ marginBottom: '20px' }}>Events that are filtered are {eventsToSave.join(', ')} </p>
                  <Timeline style={{ marginTop: '10px' }}>
                    {this.state.data.map(el => {
                      if (el.event === 'EntityDataUpdated')
                        return <Timeline.Item>Entity data updated to <code>{el.args.newData}</code></Timeline.Item>
                      if (el.event === 'DeviceCreated')
                        return <Timeline.Item color='green'>Created device with &nbsp;<Link to={"/manage-device/" + el.args.deviceId.toNumber()}><Tag>ID {el.args.deviceId.toNumber()}</Tag></Link>, identifier <code>{el.args.identifier}</code>, metadata hash <code>{el.args.metadataHash}</code> and firmware hash <code>{el.args.firmwareHash}</code></Timeline.Item>
                      if (el.event === 'DeviceTransfered')
                        return <Timeline.Item color='orange'>Device with &nbsp;<Link to={"/manage-device/" + el.args.deviceId.toNumber()}><Tag>ID {el.args.deviceId.toNumber()}</Tag></Link>transfered {el.args.newOwner === this.state.address && <span>from &nbsp;<Tag onClick={() => this.reloadWithAddress(el.args.oldOwner)}>{el.args.oldOwner}</Tag></span>}{el.args.oldOwner === this.state.address && <span>to &nbsp;<Tag onClick={() => this.reloadWithAddress(el.args.newOwner)}>{el.args.newOwner}</Tag></span>}</Timeline.Item>
                      if (el.event === 'DeviceSigned')
                        return <Timeline.Item color='purple'>Signed device with &nbsp;<Link to={"/manage-device/" + el.args.deviceId.toNumber()}><Tag>ID {el.args.deviceId.toNumber()}</Tag></Link></Timeline.Item>
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
      </div>
    )
  }
}

export default LookupEntity;