import DeviceManager, { getDefaultAccount } from '../DeviceManager';

import React, { Component } from 'react';
import { Card, Input, Divider, Timeline, message } from 'antd';

const Search = Input.Search;

class LookupEntity extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      address: null,
      data: []
    }

    this.lookupEntity = this.lookupEntity.bind(this);
  }

  async lookupEntity(address) {
    this.setState({
      loading: true
    });
    
    try {
      let instance = await DeviceManager;

      let EntityDataUpdated = instance.EntityDataUpdated({ owner: address }, { fromBlock: 0, toBlock: 'latest' });
      let results = EntityDataUpdated.get((error, logs) => {
        console.log(logs);
        if (!error) {
          this.setState({
            address: address,
            data: logs,
            loading: false
          })
        }
      });
    } catch(error) {
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
        />
        <Divider />
        <Card loading={this.state.loading} title={'Historical events (oldest to newest)'} >
          {this.state.data.length !== 0 ?
            <div>
              <Timeline style={{marginTop: '10px'}}>
                {this.state.data.map(el => <Timeline.Item>Data updated to <em>{el.args.newData}</em></Timeline.Item>)}
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