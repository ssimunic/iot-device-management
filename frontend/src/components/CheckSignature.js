import getWeb3 from '../utils/web3';
import DeviceManager from '../DeviceManager';

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Divider, Spin, Alert } from 'antd';

class CheckSignature extends Component {
  constructor(props) {
    super(props);

    this.state = {
      signatureId: this.props.match.params.signatureId,
      loading: true,
      showError: false
    }
  }
  
  componentWillReceiveProps({ match }) {
    this.setState({ 
      ...this.state,
      showError: false,
      signatureId: match.params.signatureId
    }, () => this.updateSignatureData());
  }

  async componentWillMount() {
    try {
      let web3 = (await getWeb3).web3;
      let instance = await DeviceManager;

      this.setState({
        web3,
        instance
      });

      this.updateSignatureData();
    } catch (error) {
      console.log(error);
      //message.error(error.message);
      this.setState({
        loading: false,
        showError: true
      })
    }
  }

  async updateSignatureData() {
    try {
      const { instance, signatureId } = this.state;
      let signature = await instance.signatures(signatureId);

      this.setState({
        loading: false,
        signer: signature[0],
        deviceId: signature[1].toNumber(),
        expiryTime: signature[2].toNumber(),
        revoked: signature[3],
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

  render() {
    const { loading, showError, signer, deviceId, expiryTime, revoked } = this.state;

    return (
      <div>
        <Spin spinning={loading} className="loading-spin">
          {loading === false && showError === false &&
            <div>
              <h3><div style={{ marginBottom: '20px' }}>Signature created by {signer}&nbsp;</div></h3>
              <Divider />
              <div style={{ marginBottom: '20px' }}>For device with &nbsp;<Link to={"/manage-device/" + deviceId}><Tag>ID {deviceId}</Tag></Link></div>
              <div style={{ marginBottom: '20px' }}>Expires on {new Date(expiryTime * 1000).toString()}&nbsp;</div>
              {revoked === true ? <div style={{ marginBottom: '20px' }}><strong>This signature has been revoked!</strong>&nbsp;</div> : <div></div>}
            </div>
          }
          {loading === false && showError &&
            <Alert
              message="Error"
              description="Error loading signature: invalid ID format or signature doesn't exist."
              type="error"
              showIcon
            />
          }
        </Spin >
      </div>
    );
  }
}

export default CheckSignature;