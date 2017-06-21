import { Component } from 'react';
import WMSClient from "../gs-client/WMSClient.jsx";
import { ListGroup, ListGroupItem, Button, FormGroup, Label, Input } from 'reactstrap';
import slugify from 'slugify';


export default class DistanceSetting extends Component {
  state = {
    attrs: [],
    notValidNumber: false,
    distance: '',
    emptyName: false,
    newLayerName: ''
  }


  componentDidMount(){
    const {layerName} = this.props.config;
    WMSClient.getLayerAttributes(layerName).then((attrs)=>{
      this.setState({attrs});
    });
  }


  validate_distance(){
    const {distance} = this.state
    if(!distance || isNaN(Number(distance))) {this.setState({notValidNumber:true}); return false}
    else {this.setState({notValidNumber: false}); return true}
  }


  validate_name(){
    const {newLayerName} = this.state
    if(!newLayerName) {this.setState({emptyName: true}); return false}
    else {this.setState({emptyName: false}); return true}
  }


  onComplete(){
    const {newLayerName, distance} = this.state
    if (this.validate_distance() && this.validate_name()) this.props.onComplete({newLayerName, distance})
  }


  render(){
    const {attrs, notValidNumber, distance, newLayerName, emptyName} = this.state;
    if(attrs.length == 0){
      return <div style={{margin: "10% auto auto"}} className="loading"></div>
    }

    const {onComplete, filter, config, onChange, showResults} =  this.props;
    const isGeom = (a) => {
      return a.attribute_type.toLowerCase().indexOf("gml:") == 0;
    }


    // if(this.state.loadAttributes){
    //   return(
    //     <div>
    //       <button type="button" className="btn btn-secondary" onClick={()=>{this.setState({loadAttributes:false})}}>Set Custom Distance</button>
    //       <br></br>
    //       <br></br>
    //       <h4>Select attribute</h4>
    //       <ListGroup>
    //         {
    //           attrs.map(a => isGeom(a) || !filter(a) ? null : <ListGroupItem tag="a" href="#" onClick={()=>onComplete(a.attribute)}>
    //             {a.attribute_label || a.attribute} ({a.attribute_type})
    //           </ListGroupItem>)
    //         }
    //         <br></br>
    //       </ListGroup>
    //     </div>
    //   )
    // }

    if (this.state.loadAttributes){
      return (
        <div className="card" style={{marginTop:"3%", backgroundColor: "inherit"}}>
          <div className="card-block">
            <h5 className="card-title">Select Distance Based on Attributes</h5>
            <p className="card-text">
              This feature will be available very soon in the next update
            <button style={{marginLeft: "2%", backgroundColor: "inherit"}} type="button" className="btn btn-secondary" onClick={()=>{this.setState({loadAttributes:false})}}>Set Custom Distance</button>
            </p>
          </div>
        </div>
      )
    }


    return (
      <div>
        <div className={notValidNumber? "form-group has-danger": "form-group"}>
          <Label><h4>Set Buffer Distance</h4></Label>
          <p style={{color: "#d44950"}}>
            <input style={{width:"75%", display:"inline-block", marginRight: "2%"}}
              className={notValidNumber?"form-control form-control-danger":"form-control"}
              type='text'
              value={distance?distance:''}
              onChange={(e)=>{this.setState({distance: e.target.value}, ()=>{this.validate_distance()})}} />
            {notValidNumber?"Enter a valid number!":""}
          </p>
        </div>

        <div className="card" style={{marginTop:"3%", backgroundColor: "inherit"}}>
            <div className="card-block">
              <h5 className="card-title">Usage notes</h5>
              <ul className="card-text">
                <li>The buffer distance is assumed to be in the units of the selected feature collection</li>
                <li>
                  The buffer distance is also assumed to be a Cartesian distance, so unexpected output may occur with data in geographic coordinates. Ex:
                  <p>Consider an input feature collection uses geographic coordinates (EPSG:4326), the distance must be converted to degrees. As the location of these features is approximately 42 degrees N, 3 km can be approximated as 0.024 degrees.</p>
                </li>
                <li>Negative buffer distance values may be used for input polygons. This will result in output features being reduced by the buffer distance instead of expanded.</li>
              </ul>
              <p>
              You can select attribute parameter to specify a buffer distance for each feature
              <button style={{marginLeft: "2%", backgroundColor: "inherit"}} type="button" className="btn btn-secondary" onClick={()=>{this.setState({loadAttributes:true})}}>Select Attribute</button>
              </p>
            </div>
          </div>
          <br></br>

        <div className={emptyName? "form-group has-danger": "form-group"}>
          <Label><h5>Type a New Layer Name</h5></Label>
          <p style={{color: "#d44950"}}>
            <input style={{width:"75%", display:"inline-block", marginRight: "2%"}}
              className={emptyName?"form-control form-control-danger":"form-control"}
              type='text'
              value={newLayerName?newLayerName:''}
              onChange={(e)=>{this.setState({newLayerName: e.target.value}, ()=>{this.validate_name()})}} />
            {emptyName?"Enter layer name!":""}
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onMouseDown={()=>{this.onComplete()}}>
          Generate Layer
        </button>


        <br></br>
        <br></br>
        {/*<br></br>
        <br></br>
        <p>To set distance based on attribute</p>
        <button type="button" className="btn btn-secondary" onClick={()=>{this.setState({loadAttributes:true})}}>Attribute Selector</button>*/}
      </div>
    )

  }
}
