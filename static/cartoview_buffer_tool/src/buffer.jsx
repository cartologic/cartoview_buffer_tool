import React, {Component} from 'react'
import ReactDOM from 'react-dom'
// components
import LayersList from './components/LayersList.jsx'
import Navigator from './components/Navigator.jsx'
import DistanceSetting from './components/DistanceSetting.jsx'
import NewLayerName from './components/NewLayerName.jsx'
import Results from './components/Results.jsx'
import CartoviewBufferClient from './gs-client/CartoviewBufferClient.jsx'

import "../css/styler.css";

class ConfigForm extends Component {
  state = {
    config: {},
    step: 0,
    saved: false,
    loading: true
  }


  goToStep(step){
    this.setState({step});
  }


  updateConfig(newConfig, sameStep, callBack){
    var {config, step} = this.state;
    Object.assign(config, newConfig);
    if(!sameStep) step++;
    const saved = false;
    this.setState({config, step, saved});
    if (callBack) callBack();
  }


  render() {
    var {config, step, saved} = this.state
    const steps = [{
      label: "Select Layer",
      component: LayersList,
      props: {
        title: "Select Layer",
        onComplete: (layerName) => this.updateConfig({layerName})
      }
    },
    {
      label: "Set Buffer Distance",
      component: DistanceSetting,
      props: {
        onChange: (distance) => this.updateConfig({distance}, true),
        onComplete: ({newLayerName, distance}) => {
          // convert distance to degrees by the average value of
          // length of a degree of a latitude
          // https://en.wikipedia.org/wiki/Longitude#Length_of_a_degree_of_longitude
          distance = distance / 111132
          this.updateConfig({newLayerName, distance, loading: true},false, ()=>{
          CartoviewBufferClient.generateLayer(this.state.config)
          .then((serverRes) => {this.updateConfig({successState: serverRes.success, loading: false, typeName:serverRes.type_name}, true)})
        })},
        filter: a => a.attribute_type.toLowerCase() != "xsd:string"
      }
    },
    {
      label: "Results",
      component: Results,
      props: {
        config: this.state.config
      }
    },
    ];


    return  (
      <div className="col-md-12">
        <div className="row">
          <Navigator steps={steps} step={step} onStepSelected={(step)=>this.goToStep(step)}/>
          <div className="col-md-9">
            {
              steps.map((s,index) => index == step && <s.component {...s.props} config={config}/>)
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
