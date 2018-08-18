
import React, { Component } from 'react';
import ManageDevice from './ManageDevice';

import { Input, Divider } from 'antd';

const { Search } = Input;

class LookupDevice extends Component {
  constructor(props) {
    super(props);

    this.state = {
      match: {
        params: {
          deviceId: 1
        }
      },
      searched: false
    }
  }

  lookupDevice(value) {
    this.setState({
      match: {
        params: {
          deviceId: value
        }
      },
      searched: true
    })
  }

  render() {
    return (
      <div>
        <p>
          Search for any device.
        </p>
        <Search
          placeholder="Device ID"
          onSearch={value => this.lookupDevice(value)}
          size="large"
          enterButton
        />
        {this.state.searched &&
          <div>
            <Divider />
            <ManageDevice match={this.state.match} />
          </div>
        }
      </div>
    )
  }
}

export default LookupDevice;