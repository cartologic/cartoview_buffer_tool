import {Component} from 'react';
import GenerateLayer from './GenerateLayer.jsx'

// using reactstrap Forms
import {Alert, Link, Button} from 'reactstrap';

export default class Results extends Component {
  note() {
    return (
      <div className="panel panel-info">
        <div className="panel-heading">Process Successfully Completed</div>
        <div className="panel-body">
          <div className="row">
            <div className="col-xs-12 col-md-12">
              The result of this process has been published as a portal layer. You can view the result and further configure the properties and set permission of the resulting Layer:
              <span style={{
                fontWeight: "bold"
              }}>
                {this.props.typeName.split(':').pop()}
              </span>
            </div>
          </div>

          <div className="row" style={{
            marginTop: "3%"
          }}>
            <div className="col-xs-10 col-md-3 col-md-offset-9 col-xs-offset-1">
              <a className="btn btn-primary" href={`/layers/${this.props.typeName}`} style={{
                float: "right"
              }} role="button">Layer Details</a>
            </div>
          </div>

        </div>
      </div>
    )
  }

  render() {
    const {successState, layerName, loading, newLayerName, typeName} = this.props.config;

    // loading
    if (loading)
      return <div style={{
        margin: "10% auto auto"
      }} className="loading"></div>

    else {
      // Success !!!
      {
        return(successState
          ? this.note()
          : <div className="panel panel-danger">
            <div className="panel-heading">Process Faild</div>
            <div className="panel-body">
              <div className="row">
                <div className="col-xs-12 col-md-12">
                  {"Error while creating the new layer"}
                </div>
              </div>
            </div>
          </div>)
      }
    }

  }
}
