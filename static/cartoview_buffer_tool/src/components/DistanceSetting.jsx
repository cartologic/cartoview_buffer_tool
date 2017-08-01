import {Component} from 'react';
import WMSClient from "../gs-client/WMSClient.jsx";
import {
  ListGroup,
  ListGroupItem,
  Button,
  FormGroup,
  Label,
  Input
} from 'reactstrap';
import slugify from 'slugify';

export default class DistanceSetting extends Component {
  state = {
    attrs: [],
    notValidNumber: false,
    distance: this.props.config
      ? (this.props.config.distance * 111132)
      : '',
    emptyName: false,
    newLayerName: this.props.config
      ? this.props.config.newLayerName
      : ''
  }

  componentDidMount() {
    const {layerName} = this.props.config;
    WMSClient.getLayerAttributes(layerName).then((attrs) => {
      this.setState({attrs});
    });
  }

  validate_distance() {
    const {distance} = this.state
    if (!distance || isNaN(Number(distance))) {
      this.setState({notValidNumber: true});
      return false
    } else {
      this.setState({notValidNumber: false});
      return true
    }
  }

  validate_name() {
    const {newLayerName} = this.state
    if (!newLayerName) {
      this.setState({emptyName: true});
      return false
    } else {
      this.setState({emptyName: false});
      return true
    }
  }

  onComplete() {
    const {newLayerName, distance} = this.state
    if (this.validate_distance() && this.validate_name())
      this.props.onComplete({newLayerName, distance})
  }

  renderHeader() {
    return (
      <div>
        <div className="row">
          <div className="col-xs-5 col-md-4">
            <h4>Set Buffer Distance</h4>
          </div>
          <div className="col-xs-7 col-md-8">
            <button type="button" className="btn btn-primary btn-sm pull-right disabled" onMouseDown={() => {
              this.onComplete()
            }}>
              {'Next >>'}
            </button>

            <button style={this.props.step == 0
              ? {
                display: "inline-block",
                margin: "0px 3px 0px 3px",
                visibility: 'hidden'
              }
              : {
                display: "inline-block",
                margin: "0px 3px 0px 3px"
              }} className="btn btn-primary btn-sm pull-right" onClick={() => this.props.onPrevious()}>{"<< Previous"}</button>
          </div>
        </div>
        <br></br>
        <div className="row">
          <div className="col-xs-5 col-md-4">
            <h4></h4>
          </div>
          <div className="col-xs-7 col-md-8">
            <button type="button" className="btn btn-primary btn-sm pull-right" onMouseDown={() => {
              this.onComplete()
            }}>
              Generate Layer
            </button>
          </div>
        </div>
      </div>

    )
  }

  render() {
    const {attrs, notValidNumber, distance, newLayerName, emptyName} = this.state;
    if (attrs.length == 0) {
      return <div style={{
        margin: "10% auto auto"
      }} className="loading"></div>
    }

    const {onComplete, filter, config, onChange, showResults} = this.props;
    const isGeom = (a) => {
      return a.attribute_type.toLowerCase().indexOf("gml:") == 0;
    }

    return (
      <div>
        {this.renderHeader()}
        <div className={notValidNumber
          ? "form-group has-danger"
          : "form-group"}>
          <Label>
            <h5>Enter buffer distance in meters</h5>
          </Label>
          <p style={{
            color: "#d44950"
          }}>
            <input style={{
              width: "75%",
              display: "inline-block",
              marginRight: "2%"
            }} className={notValidNumber
              ? "form-control form-control-danger"
              : "form-control"} type='text' value={distance
              ? distance
              : ''} onChange={(e) => {
              this.setState({
                distance: e.target.value
              }, () => {
                this.validate_distance()
              })
            }}/> {notValidNumber
              ? "Enter a valid number!"
              : ""}
          </p>
        </div>

        <div className={emptyName
          ? "form-group has-danger"
          : "form-group"}>
          <Label>
            <h5>Type a New Layer Name</h5>
          </Label>
          <p style={{
            color: "#d44950"
          }}>
            <input style={{
              width: "75%",
              display: "inline-block",
              marginRight: "2%"
            }} className={emptyName
              ? "form-control form-control-danger"
              : "form-control"} type='text' value={newLayerName
              ? newLayerName
              : ''} onChange={(e) => {
              this.setState({
                newLayerName: e.target.value
              }, () => {
                this.validate_name()
              })
            }}/> {emptyName
              ? "Enter layer name!"
              : ""}
          </p>
        </div>
      </div>
    )

  }
}
