import { Component } from 'react';
import GenerateLayer from './GenerateLayer.jsx'

// using reactstrap Forms
import { Button, FormGroup, Label, Input } from 'reactstrap';

export default class NewLayerName extends Component {

  render(){
    const {config, onChange, onComplete, showResults} = this.props;
    return (
      <div>
        <FormGroup>
          <Label for="exampleEmail"><h4>Set New Layer Name</h4></Label>
          <Input type="text" value={config.outputLayerName} onChange={e => onChange(e.target.value)} placeholder="Layer Name" />
        </FormGroup>
        <GenerateLayer
          onComplete ={onComplete}
          showResults={(WPSResponse)=>{showResults(WPSResponse)}}
          config={config}/>
      </div>
    );
  }
}