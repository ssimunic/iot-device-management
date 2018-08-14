import React, { Component } from 'react';
import './RegisterDevice.css';

import { Steps, Button, Input, Card, Row, Col, Avatar, message } from 'antd';

const Step = Steps.Step;
const { Meta } = Card;

const steps = [{
  title: 'Identifier',
}, {
  title: 'Metadata',
}, {
  title: 'Firmware',
}, {
  title: 'Confirm',
}];

class RegisterDevice extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: 0,
      identifier: null,
      metadataHash: null,
      firmwareHash: null
    };
  }

  next() {
    const { current, identifier, metadataHash, firmwareHash } = this.state;

    if ((current === 0) && (identifier === null || identifier === '')) {
      message.error('Invalid identifier.');
    } else if ((current === 1) && (metadataHash === null || metadataHash === '')) {
      message.error('Invalid metadata hash.');
    } else if ((current === 2) && (firmwareHash === null || firmwareHash === '')) {
      message.error('Invalid firmware hash.');
    } else {
      this.setState(prevState => ({ current: prevState.current + 1 }));
    }
  }

  prev() {
    const current = this.state.current - 1;
    this.setState({ current });
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  getContentForStep(step) {
    const { identifier, metadataHash, firmwareHash } = this.state;

    if (step === 0) {
      return (
        <div>
          <Input
            placeholder="Identifier e.g. Ethereum address"
            style={{ maxWidth: '500px' }}
            value={identifier}
            name="identifier"
            onChange={(e) => this.handleChange(e)}
          />
        </div>
      );
    }

    if (step === 1) {
      return (
        <div>
          <Input
            placeholder="Metadata hash"
            style={{ maxWidth: '500px' }}
            value={metadataHash}
            name="metadataHash"
            onChange={(e) => this.handleChange(e)}
          />
        </div>
      );
    }

    if (step === 2) {
      return (
        <div>
          <Input
            placeholder="Firmware hash"
            style={{ maxWidth: '500px' }}
            value={firmwareHash}
            name="firmwareHash"
            onChange={(e) => this.handleChange(e)}
          />
        </div>
      );
    }

    if (step === 3) {
      return (
        <div style={{marginBottom: '50px'}}>
          <Row gutter={16}>
            <Col span={12} offset={6}>
              <Card title="Card title" bordered={false}>Card content</Card>
            </Col>
          </Row >
        </div >
      );
    }
  }

  createDevice() {
    message.success('Processing complete!');
  }

  render() {
    const { current } = this.state;
    return (
      <div>
        <Steps current={current}>
          {steps.map(item => <Step key={item.title} title={item.title} />)}
        </Steps>
        <div className="steps-content">{this.getContentForStep(current)}</div>
        <div className="steps-action">
          {
            current < steps.length - 1
            && <Button type="primary" onClick={() => this.next()}>Next</Button>
          }
          {
            current === steps.length - 1
            && <Button type="primary" onClick={() => this.createDevice()}>Create</Button>
          }
          {
            current > 0
            && (
              <Button style={{ marginLeft: 8 }} onClick={() => this.prev()}>
                Previous
            </Button>
            )
          }
        </div>
      </div>
    );
  }
}

export default RegisterDevice;