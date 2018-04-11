import { Loader, NextButton, PreviousButton } from './CommonComponents'

import { Component } from 'react'
import React from 'react'
import t from 'tcomb-form'

const alphaNumericRegex = /(^[A-Za-z_][A-Za-z0-9_]+$)/
const regx = RegExp('^[A-Za-z_][A-Za-z0-9_]+$')
const Form = t.form.Form
const AlphaNumeric = t.refinement( t.String, ( n ) => {
  let valid = false
  if ( regx.test(n)) {
    valid = true
  }
  if(n.length > 63){
    valid = false
  }
  return valid
} )
AlphaNumeric.getValidationErrorMessage = ( value ) => {
  if ( !value ) {
    return 'Required'
  } else {
    if ( !value.match( alphaNumericRegex ) ) {
      return 'Only (AlphaNumeric,_) Allowed and numbers not allowed as prefix'
    }
    if(value.length > 63){
      return "Layer name cannot exceed the limit of 63 characters!"
    }
  }
}
const formSchema = t.struct( {
  title: AlphaNumeric,
  distance: t.Number
} )
const options = {
  fields: {
    title: {
      label: "Layer Name",
      help: "Enter New Layer Name"
    },
    distance: {
      label: "Distance",
      help: "Enter Distance in Meter"
    },
  }
}
export default class BufferSettings extends Component {
  constructor( props ) {
    super( props )
    this.state = {
      value: {
        title: this.props.config.newLayerName ? this.props.config.newLayerName : "",
        distance: this.props.config.distance ? this.props.config.distance *
          111132 : null,
      },
      loading: false,
      error: false
    }
  }
  checkLayerNameExist = ( name ) => {
    const { urls } = this.props
    this.setState( { loading: true, error: false } )
    return fetch( `${urls.layersAPI}?typename=geonode:${name}` ).then(
      response => response.json() )
  }
  onComplete = () => {
    const value = this.form.getValue()
    if ( value ) {
      this.checkLayerNameExist( value.title ).then( response => {
        if ( response.objects.length == 0 ) {
          this.props.onComplete( {newLayerName:value.title,distance:value.distance} )
        } else {
          this.setState( { loading: false, error: true } )
        }
      } )
    }
  }
  onChange = ( value ) => {
    this.setState( { value: value } )
  }
  render() {
    return (
      <div>
        <div className="row">
          <div className="col-xs-5 col-md-4">
            <h4>{'Buffer Settings'}</h4>
          </div>
          <div className="col-xs-7 col-md-8">
            <NextButton message={"Save"} clickAction={() => this.onComplete()} />
            <PreviousButton clickAction={() => this.props.onPrevious()} />
          </div>
        </div>
        {!this.state.loading && this.state.error && <p className="text-danger">{"Layer Name already exist please choose another one"}</p>}
        {this.state.loading && <Loader />}
        <Form
          ref={(form) => this.form = form}
          value={this.state.value}
          type={formSchema}
          onChange={this.onChange}
          options={options} />
      </div>
    )
  }
}
