import getWeb3 from '../utils/web3';
import DeviceManager, { getDefaultAccount } from '../DeviceManager';

import React, { Component } from 'react';
import { Card, Input, Button, Icon, message, notification } from 'antd';

const { TextArea } = Input;

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message,
    description
  });
};

class EditEntity extends Component {
  constructor(props) {
    super(props);

    this.state = {
      myData: null,
      showEdit: false,
      web3: null,
      instance: null,
      loading: true,
      filter: null
    }

    this.toggleEdit = this.toggleEdit.bind(this);
    this.commonChange = this.commonChange.bind(this);
    this.saveMyData = this.saveMyData.bind(this);
    this.updateMyData = this.updateMyData.bind(this);
    this.watchForChanges = this.watchForChanges.bind(this);
  }

  async componentWillMount() {
    try {
      let results = await getWeb3;
      let instance = await DeviceManager;

      this.setState({
        web3: results.web3,
        instance
      });

      this.updateMyData();

    } catch (error) {
      console.log(error);
      message.error(error.message);
    }
  }

  watchForChanges() {
    let filter = this.state.web3.eth.filter('latest', (error, result) => {
      if (!error) {
        openNotificationWithIcon('success', 'Transaction mined', 'Your entity data has been updated.');
        this.state.filter.stopWatching();
        this.updateMyData();
      } else {
        console.error(error);
      }
    });

    this.setState({
      filter
    })
  }

  async updateMyData() {
    try {
      let result = await this.state.instance.ownerToEntity(getDefaultAccount());
      this.setState({
        myData: result,
        myDataNew: result,
        loading: false
      })
    } catch (error) {
      console.log(error);
      message.error(error.message);
    }
  }

  toggleEdit() {
    this.setState(prevState => ({
      showEdit: !prevState.showEdit
    }));
  }

  commonChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  async saveMyData() {
    try {
      if (this.state.myDataNew !== this.state.myData) {
        let instance = await DeviceManager;
        await instance.updateEntityData(this.state.myDataNew, { from: getDefaultAccount() });
        this.watchForChanges();
        openNotificationWithIcon('info', 'Transaction sent', 'Once mined, your entity data will be updated.');
        this.setState({
          loading: true,
        });
      }
      this.toggleEdit();
    } catch (error) {
      console.log(error);
      message.error(error.message);
    }
  }

  render() {
    return (
      <div>
        <p>
          Edit your entity details.
        </p>
        <Card style={{ maxWidth: '500px' }} loading={this.state.loading} title={getDefaultAccount()}>
          {this.state.showEdit ?
            <div>
              <TextArea name="myDataNew" value={this.state.myDataNew} onChange={this.commonChange} />
              <Button type="primary" style={{ marginTop: '10px' }} onClick={this.saveMyData}>Save</Button>
            </div>
            :
            <p>{this.state.myData || <em>empty data</em>} <a><Icon type="edit" onClick={this.toggleEdit} /></a></p>
          }
        </Card>
      </div>
    )
  }
}

export default EditEntity;