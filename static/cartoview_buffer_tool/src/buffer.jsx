import React, {Component} from 'react'
import ReactDOM from 'react-dom'
// components
import LayersList from './components/LayersList.jsx'
import Navigator from './components/Navigator.jsx'
import AboutPage from './components/AboutPage.jsx'
import DistanceSetting from './components/DistanceSetting.jsx'
import NewLayerName from './components/NewLayerName.jsx'
import Results from './components/Results.jsx'
import CartoviewBufferClient from './gs-client/CartoviewBufferClient.jsx'

import {DefaultModalStyle} from './constants/constants.jsx'
import Modal from 'react-modal';

import "../css/styler.css";

class ConfigForm extends Component {
  state = {
    config: {},
    step: 0,
    saved: false,
    loading: true,

    modalIsOpen: false
  }

  goToStep(step) {
    this.setState({step});
  }

  aboutHeader() {
    return (
      <h3>Buffer Tool</h3>
    )
  }

  aboutBody() {
    return (
      <div>
        <p>
          Takes a feature collection and applies a buffer to each feature. The buffer distance can be a fixed value for all features, a variable value, with the values taken from an attribute in the feature collection, or it could be a combination of the two
        </p>

        <div className="row">
          <div className='col-xs-12 col-md-10 col-md-offset-2'>
            <img className='img-responsive' src={`/static/${APP_NAME}/images/bufferfc.png`} alt=""/>
          </div>
        </div>
      </div>
    )
  }

  updateConfig(newConfig, sameStep, callBack) {
    var {config, step} = this.state;
    Object.assign(config, newConfig);
    if (!sameStep)
      step++;
    const saved = false;
    this.setState({config, step, saved});
    if (callBack)
      callBack();
    }

  helpModal() {
    return (
      <Modal className="modal-dialog" isOpen={this.state.modalIsOpen} style={DefaultModalStyle} onRequestClose={() => {
        this.setState({modalIsOpen: false})
      }}>
        <div className="">
          <div className="panel panel-default">
            <div className="panel-heading">
              <div className="row">
                <div className="col-xs-6 col-md-6">
                  {this.aboutHeader()}
                </div>
                <div className="col-xs-1 col-md-1 col-md-offset-5 col-xs-offset-5">
                  <div className="pull-right">
                    <a className="btn btn btn-primary" onClick={(e) => {
                      e.preventDefault();
                      this.setState({modalIsOpen: false})
                    }}>
                      x
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="panel-body">
              <div className="row">
                <div className="col-md-12">
                  {this.aboutBody()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    )
  }

  navBar() {
    return (
      <nav className="navbar navbar-default">
        <div className="container">
          <div className="row">
            <div className="col-xs-6 col-md-6">
              <h4 style={{
                color: "dimgray"
              }}>Buffer Tool</h4>
            </div>
            <div className="col-xs-1 col-md-1 col-md-offset-5 col-xs-offset-4">
              <button type="button" style={{
                marginTop: "8%"
              }} className="btn btn-primary" onClick={() => {
                this.setState({modalIsOpen: true})
              }}>
                ?
              </button>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  render() {
    var {config, step, saved} = this.state
    const steps = [
      {
        label: "Select Layer",
        component: LayersList,
        props: {
          onComplete: (layerName) => {
            this.updateConfig({layerName})
          },
          layerType: "",
          step: step
        }
      }, {
        label: "Set Buffer Distance",
        component: DistanceSetting,
        props: {
          onChange: (distance) => this.updateConfig({
            distance
          }, true),
          onComplete: ({newLayerName, distance}) => {
            // convert distance to degrees by the average value of
            // length of a degree of a latitude
            // https://en.wikipedia.org/wiki/Longitude#Length_of_a_degree_of_longitude
            distance = distance / 111132
            this.updateConfig({
              newLayerName,
              distance,
              loading: true
            }, false, () => {
              CartoviewBufferClient.generateLayer(this.state.config).then((serverRes) => {
                this.updateConfig({
                  successState: serverRes.success,
                  loading: false,
                  typeName: serverRes.type_name
                }, true)
              }).catch((err) => {
                this.updateConfig({
                  successState: false,
                  loading: false
                }, true, () => {
                  console.error(err);
                })
              })
            })
          },
          filter: a => a.attribute_type.toLowerCase() != "xsd:string",
          onPrevious: () => this.goToStep(step - 1),
          config: this.state.config
        }
      }, {
        label: "Results",
        component: Results,
        props: {
          config: this.state.config,
          typeName: this.state.config.typeName
        }
      }
    ];

    return (
      <div className="col-md-12">
        {this.helpModal()}
        <div className="row">{this.navBar()}</div>
        <div className="row">
          <Navigator steps={steps} step={step} onStepSelected={(step) => this.goToStep(step)}/>
          <div className="col-md-9">
            {steps.map((s, index) => index == step && <s.component {...s.props} config={config}/>)
}
          </div>
        </div>
      </div>
    )
  }
}

global.ConfigForm = ConfigForm;
global.React = React;
global.ReactDOM = ReactDOM;
export default ConfigForm;
