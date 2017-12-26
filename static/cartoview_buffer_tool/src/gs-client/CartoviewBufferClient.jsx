import { getCRSFToken } from '../helpers/helpers'
class CartoviewBufferClient {
  generateLayer( obj ) {
    let formValues = obj
    let form = new FormData()
    form.append( "distance", formValues.distance )
    form.append( "layer", formValues.layerName )
    form.append( "newLayerName", formValues.newLayerName )
    return fetch( 'generate-layer', {
      method: "POST",
      body: form,
      credentials: "include",
      headers: new Headers( {
        "X-CSRFToken": getCRSFToken()
      } )
    } )
  }
}
export default new CartoviewBufferClient()
