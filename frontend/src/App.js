import getWeb3 from './utils/web3';
import DeviceManager from './DeviceManager';

import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import './App.css';

import Home from './components/Home';
import RegisterDevice from './components/RegisterDevice';
import ManageDevices from './components/ManageDevices';
import EditEntity from './components/EditEntity';
import LookupEntity from './components/LookupEntity';
import ManageDevice from './components/ManageDevice';
import LookupDevice from './components/LookupDevice';
import CheckSignature from './components/CheckSignature';

import { Layout, Menu, Icon, Tag, Alert, Spin } from 'antd';

const { SubMenu } = Menu;
const { Header, Content, Footer, Sider } = Layout;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: null,
      deviceManagerInstance: null,
      errorMessage: '',
      loading: true
    }
  }

  async componentWillMount() {
    getWeb3.then(results => {
      this.setState({
        web3: results.web3,
      });

      console.log(`Using address: ${this.state.web3.eth.accounts[0]}`);

      return DeviceManager.then(instance => {
        this.setState({
          loading: false,
          deviceManagerInstance: instance
        });
  
        console.log(`Contract address: ${instance.address}`);
      }).catch(error => {
        console.log(error);
        this.setState({
          errorMessage: error.message,
          loading: false
        });
      });
    }).catch(() => {
      let errorMessage = 'Error finding web3. Please install MetaMask.';
      console.log(errorMessage);
      this.setState({
        errorMessage: errorMessage,
        loading: false
      });
    });
  }

  mainContent() {
    if (!this.state.loading) {
      let childComponent;

      if (this.state.web3 == null || this.state.deviceManagerInstance == null) {
        childComponent = <div>
          <h1>Resolve the following issues to continue</h1>
          <Alert
            message="Error"
            description={this.state.errorMessage}
            type="error"
            showIcon
          />
        </div>
      } else {
        childComponent = <div>
          <Route exact path="/" component={Home} />
          <Route path="/edit-entity" component={EditEntity} />
          <Route path="/lookup-entity/:address?" component={LookupEntity} />
          <Route path="/register-device" component={RegisterDevice} />
          <Route path="/manage-devices" component={ManageDevices} />
          <Route path="/manage-device/:deviceId" component={ManageDevice} />
          <Route path="/lookup-device" component={LookupDevice} />
          <Route path="/check-signature/:signatureId" component={CheckSignature} />
        </div>
      }
      return (
        <div>
          {childComponent}
        </div>
      );
    }
  }
  render() {
    let statusTag;

    if (this.state.web3 == null) {
      statusTag = <Tag color="red">Web3 missing</Tag>;
    } else if (this.state.deviceManagerInstance == null) {
      statusTag = <Tag color="red">Network error</Tag>;
    } else {
      statusTag = <Tag color="green">OK</Tag>;
    }

    return (
      <Router>
        <Layout style={{ height: "100vh" }}>
          <Header className="header">
            <Menu
              theme="dark"
              mode="horizontal"
              defaultSelectedKeys={['1']}
              style={{ lineHeight: '64px' }}
            >
              <Menu.Item key="1">
                <Link to="/" className="nav-text">IoT Device Management</Link>
              </Menu.Item>
              <Menu.Item key="2" style={{ float: 'right' }}>
                Status: {statusTag}
              </Menu.Item>
            </Menu>
          </Header>
          <Content style={{ padding: '24px 50px' }}>
            <Layout style={{ padding: '24px 0', background: '#fff' }}>
              <Sider width={200} style={{ background: '#fff' }}>
                <Menu
                  mode="inline"
                  defaultSelectedKeys={['']}
                  defaultOpenKeys={['sub1', 'sub2', 'sub3']}
                  style={{ height: '100%' }}
                >
                  <SubMenu key="sub1" title={<span><Icon type="user" />Entities</span>}>
                    <Menu.Item key="1">
                      <Link to="/edit-entity" className="nav-text">Edit</Link>
                    </Menu.Item>
                    <Menu.Item key="2">
                      <Link to="/lookup-entity" className="nav-text">Lookup</Link>
                    </Menu.Item>
                  </SubMenu>
                  <SubMenu key="sub2" title={<span><Icon type="laptop" />Devices</span>}>
                    <Menu.Item key="3">
                      <Link to="/register-device" className="nav-text">Register</Link>
                    </Menu.Item>
                    <Menu.Item key="4">
                      <Link to="/manage-devices" className="nav-text">Manage</Link>
                    </Menu.Item>
                    <Menu.Item key="5">
                      <Link to="/lookup-device" className="nav-text">Lookup</Link>
                    </Menu.Item>
                    {/*
                    <Menu.Item key="5">
                      <Link to="#" className="nav-text">Filter</Link>
                    </Menu.Item>
                    */}
                  </SubMenu>
                  {/*
                  <SubMenu key="sub3" title={<span><Icon type="form" />Signatures</span>}>

                    <Menu.Item key="6">
                      <Link to="#" className="nav-text">Sign</Link>
                    </Menu.Item>
                    <Menu.Item key="7">
                      <Link to="/check-signature" className="nav-text">Check</Link>
                    </Menu.Item>
                  </SubMenu>
                  */}
                </Menu>
              </Sider>
              <Content style={{ padding: '0 24px', minHeight: 400 }}>
                <Spin spinning={this.state.loading} className="loading-spin">
                  {this.mainContent()}
                </Spin>
              </Content>
            </Layout>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            IoT Device Management &copy; 2018 Created by Silvio Simunic
        </Footer>
        </Layout>
      </Router>
    );
  }
}

export default App;
