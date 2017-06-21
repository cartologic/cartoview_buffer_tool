import slugify from 'slugify';

class CartoviewBufferClient {
  generateLayer(obj){
    console.log("obj: ", obj);
    let formValues = obj
    let form = new FormData();
    form.append("distance", formValues.distance);
    form.append("layer", formValues.layerName);
    form.append("newLayerName", slugify(formValues.newLayerName, '_'));

    return fetch('generate-layer',{
      method:"POST",
       body:form,
       credentials: "include",
       headers: new Headers({
         "X-CSRFToken": CSRF_TOKEN
       })
     }).then(res => res.json())
  }
}

export default new CartoviewBufferClient();
