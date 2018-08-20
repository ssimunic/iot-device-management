import DeviceManager, { getDefaultAccount } from '../DeviceManager';

import React, { Component } from 'react';
import { Spin, List, message } from 'antd';
import { Link } from 'react-router-dom';

class ManageDevices extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      instance: null,
      devices: []
    }
  }

  async componentDidMount() {
    try {
      let instance = await DeviceManager;
      let deviceIds = (await instance.getDevicesByOwner(getDefaultAccount())).map(el => el.toNumber());

      let devicePromises = [];
      for (let deviceId of deviceIds) {
        let devicePromise = instance.devices(deviceId);
        devicePromises.push(devicePromise);
      }

      let devices = await Promise.all(devicePromises);

      this.setState({
        instance,
        devices,
        deviceIds,
        loading: false
      });
    } catch (error) {
      console.log(error);
      message.error(error.message);
    }
  }

  render() {
    const { devices, loading } = this.state;

    return (
      <div>
        <Spin spinning={loading} className="loading-spin">
          {devices.length > 0 && !loading &&
            <div>
              <p>
                Below you can find your devices. Click to see more details and manage.
              </p>
              <List
                bordered={true}
                itemLayout="horizontal"
                dataSource={devices}
                renderItem={(device, index) => (
                  <List.Item>
                    <List.Item.Meta
                      /*avatar={<Icon type="profile" style={{ fontSize: 36 }} />}*/
                      title={<Link to={`/manage-device/${this.state.deviceIds[index]}`}>{`Device ID ${this.state.deviceIds[index]}`}</Link>}
                      description={`Identifier ${device[1]}`}
                    />
                  </List.Item>
                )}
              />
            </div>
          }
          {devices.length === 0 && !loading &&
            <p>You don't have any devices registered.</p>
          }
        </Spin>
      </div>
    )
  }
}

export default ManageDevices;