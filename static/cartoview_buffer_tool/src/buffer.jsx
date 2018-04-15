import "../css/styler.css";

import React, { Component } from 'react'

import CartoviewBufferClient from './gs-client/CartoviewBufferClient.jsx'
import { DefaultModalStyle } from './constants/constants.jsx'
import DistanceSetting from './components/DistanceSetting.jsx'
import LayersList from './components/LayersList.jsx'
import Modal from 'react-modal';
import Navigator from './components/Navigator.jsx'
import NewLayerName from './components/NewLayerName.jsx'
import Results from './components/Results.jsx'

const distanceRatio = 111132
class BufferTool extends Component {
  state = {
    config: {},
    step: 0,
    saved: false,
    loading: true,
    error: false,
    errorMessage: "",
    currentLayer: null,
    modalIsOpen: false
  }
  goToStep( step ) {
    this.setState( { step } );
  }
  aboutHeader() {
    return ( <h3>{"Buffer Tool"}</h3> )
  }
  aboutBody() {
    const { urls } = this.props
    return (
      <div>
        <p>
          {"Takes a feature collection and applies a buffer to each feature. The buffer distance can be a fixed value for all features, a variable value, with the values taken from an attribute in the feature collection, or it could be a combination of the two"}
        </p>

        <div className="row">
          <div className='col-xs-12 col-md-10 col-md-offset-2'>
            <img className='img-responsive' src={`${urls.appStatic}/images/bufferfc.png`} alt="" />
          </div>
        </div>
      </div>
    )
  }
  updateConfig( newConfig, sameStep, callBack ) {
    var { config, step } = this.state;
    Object.assign( config, newConfig );
    if ( !sameStep ) step++;
    const saved = false;
    this.setState( { config, step, saved } );
    if ( callBack ) callBack();
  }
  helpModal() {
    return (
      <Modal className="modal-dialog" isOpen={this.state.modalIsOpen} style={DefaultModalStyle} onRequestClose={() => {
        this.setState({ modalIsOpen: false })
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
                      this.setState({ modalIsOpen: false })
                    }}>
                      {"x"}
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
      <div className="flex-element styler-nav">
        <h4>{"Buffer Tool"}</h4>
        <div className="fill-empty"></div>
        <button type="button" className="btn btn-primary" onClick={() => {
          this.setState({ modalIsOpen: true })
        }}>
          {"?"}
        </button>

      </div>
    )
  }
  createBufferedLayer = ( bufferSettings ) => {
    let { config, step } = this.state
    let { distance, newLayerName } = bufferSettings
    console.log( "BB", bufferSettings )
    distance = distance / distanceRatio
    this.setState( {
      loading: true,
      step: ++step,
      config: { ...this.state.config,
        newLayerName,
        distance
      }
    }, () => {
      CartoviewBufferClient.generateLayer( this.state.config ).then(
        response => {
          if ( response.status > 400 ) {
            this.setState( {
              config: { ...this.state.config,
                successState: false
              },
              loading: false
            } )
            throw Error( "SERVER Error" )
          } else {
            return response.json()
          }
        } ).then( ( serverRes ) => {
        this.setState( {
          loading: false,
          config: { ...this.state.config,
            successState: serverRes.success,
            typeName: serverRes.type_name
          }
        } )
      } ).catch( error => {} )
    } )
  }
  render() {
    var { config, step, saved, errorMessage, error, currentLayer, loading } =
    this.state
    const { username, urls, workspace } = this.props
    const steps = [
      {
        label: "Select Layer",
        component: LayersList,
        props: {
          onComplete: ( layer ) => {
            this.setState( { currentLayer: layer } )
            this.updateConfig( { layerName: layer.typename } )
          },
          layerType: "",
          username,
          urls,
          currentLayer,
          step: step
        }
      }, {
        label: "Set Buffer Distance",
        component: DistanceSetting,
        props: {
          onComplete: ( bufferSettings ) => {
            // convert distance to degrees by the average value of
            // length of a degree of a latitude
            // https://en.wikipedia.org/wiki/Longitude#Length_of_a_degree_of_longitude
            this.createBufferedLayer( bufferSettings )
          },
          urls,
          username,
          config,
          workspace,
          onPrevious: () => this.goToStep( step - 1 ),
          config: this.state.config
        }
      }, {
        label: "Results",
        component: Results,
        props: {
          loading,
          config: this.state.config,
          typeName: this.state.config.typeName
        }
      }
    ];
    return (
      <div className="col-md-12">
        {this.helpModal()}
        <div className="row">{this.navBar()}</div>
        <hr />
        <div className="flex-element styler-nav current-info">
          {currentLayer && <a target="_blank" href={`${currentLayer.detail_url}`}>{`Layer: ${currentLayer.title}`}</a>}
          {config && config.distance && <span>{`Distance: ${Math.round(config.distance * distanceRatio)}`}</span>}
        </div>
        {(currentLayer || config.distance) && <hr />}
        <div className="row">
          <Navigator steps={steps} step={step} onStepSelected={(step) => this.goToStep(step)} />
          <div className="col-md-9">
            {steps.map((s, index) => index == step && <s.component {...s.props} config={config} />)
            }
          </div>
        </div>
      </div>
    )
  }
}
export default BufferTool;
