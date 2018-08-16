import DeviceManager, { getDefaultAccount } from '../DeviceManager';
import ethUtil from 'ethereumjs-util';

import React, { Component } from 'react';
import { Button, Card, Input, Divider, Timeline, message } from 'antd';

const Search = Input.Search;

class LookupEntity extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      searchValue: '',
      address: null,
      data: []
    }

    this.lookupEntity = this.lookupEntity.bind(this);
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

      let eventsToSave = ['EntityDataUpdated', 'DeviceCreated'];
      let allEvents = instance.allEvents({ fromBlock: 0, toBlock: 'latest' });
      allEvents.get((error, logs) => {
        if (!error) {
          this.setState({
            address: address,
            data: logs.filter(el => eventsToSave.includes(el.event) && el.args.owner === address),
            loading: false
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
        <Search
          placeholder="Input address"
          onSearch={value => this.lookupEntity(value)}
          size="large"
          enterButton
          value={this.state.searchValue}
          onChange={(e) => this.setState({ searchValue: e.target.value })}
        />
        <br/><br/>
        <Button size="small" onClick={() => this.setState({ searchValue: getDefaultAccount() })}>Set to my address</Button>
        <Divider />
        <Card loading={this.state.loading} title={'Historical events (oldest to newest)'}>
          {this.state.data.length !== 0 ?
            <div>
              <Timeline style={{ marginTop: '10px' }}>
                {this.state.data.map(el => {
                  if (el.event === 'EntityDataUpdated')
                    return <Timeline.Item>Data updated to <em>{el.args.newData}</em></Timeline.Item>
                  if (el.event === 'DeviceCreated')
                    return <Timeline.Item color='green'>Created device with ID <em>{el.args.deviceId.toNumber()}</em> and identifier <em>{el.args.identifier}</em></Timeline.Item>
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
    )
  }
}

export default LookupEntity;