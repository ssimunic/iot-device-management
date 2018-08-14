import getWeb3 from '../utils/web3';
import DeviceManager, { getDefaultAccount } from '../DeviceManager';

import React, { Component } from 'react';
import { Card, Input, Button, Modal, message, notification } from 'antd';

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
      loading: true,
      filter: null
    }

    this.toggleEdit = this.toggleEdit.bind(this);
    this.commonChange = this.commonChange.bind(this);
    this.saveMyData = this.saveMyData.bind(this);
    this.updateMyData = this.updateMyData.bind(this);
  }

  componentWillMount() {
    this.updateMyData();

    getWeb3.then(results => {
      this.setState({
        web3: results.web3,
      });

      let filter = this.state.web3.eth.filter('latest', (error, result) => {
        if (!error) {
          openNotificationWithIcon('success', 'Transaction mined', 'Data has been updated.');
          this.updateMyData();
        } else {
          console.error(error);
        }
      });

      this.setState({
        filter
      })
    });
  }

  componentWillUnmount() {
    this.state.filter.stopWatching();
  }

  updateMyData() {
    DeviceManager.then((instance) => {
      return instance.ownerToEntity(getDefaultAccount());
    }).then(result => {
      this.setState({
        myData: result,
        myDataNew: result,
        loading: false
      })
    }).catch(error => {
      console.log(error);
      message.error(error.message);
    });
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
      let instance = await DeviceManager;
      await instance.updateEntityData(this.state.myDataNew, { from: getDefaultAccount() });
      openNotificationWithIcon('info', 'Transaction sent', 'Once mined, data will be updated.');
      this.toggleEdit();
      this.setState({
        loading: true
      });
    } catch (error) {
      console.log(error);
      message.error(error.message);
    }
  }

  render() {
    return (
      <div>
        <Card loading={this.state.loading} title={getDefaultAccount()} extra={<a onClick={this.toggleEdit}>{this.state.showEdit ? 'Done' : 'Edit'}</a>} >
          {this.state.showEdit ?
            <div>
              <TextArea name="myDataNew" value={this.state.myDataNew} onChange={this.commonChange} />
              <Button type="primary" style={{ marginTop: '10px' }} onClick={this.saveMyData}>Save</Button>
            </div>
            :
            <p>{this.state.myData || <em>empty data</em>}</p>
          }
        </Card>
      </div>
    )
  }
}

export default EditEntity;