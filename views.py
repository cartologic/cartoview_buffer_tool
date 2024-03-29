import requests
import uuid

from guardian.shortcuts import get_objects_for_user

from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.gis.geos import Polygon
from django.utils.translation import ugettext as _

from geonode.layers.models import Layer, Attribute
from geonode.geoserver.helpers import ogc_server_settings
from geoserver.catalog import Catalog

from django.conf import settings

from . import APP_NAME, __version__


username, password = ogc_server_settings.credentials
gs_catalog = Catalog(ogc_server_settings.rest, username, password)
ds_db_name = settings.OGC_SERVER['default']['DATASTORE']
default_store = settings.DATABASES[ds_db_name]['NAME']

@login_required
def index(request):
    request = request
    context = {
        "v": __version__,
        "APP_NAME": APP_NAME,
        'username': request.user,
        "workspace": settings.DEFAULT_WORKSPACE
    }
    return render(request, "%s/index.html" % APP_NAME, context)


def _get_permitted_queryset(request, permission):
    ''' returns qs of layers for a specific user asper permission'''
    permitted_ids = get_objects_for_user(request.user, permission).values('id')
    queryset = Layer.objects.filter(id__in=permitted_ids)
    return queryset


def update_geonode(request, resource):
    ''' Creates a table for the layer created in geoserver'''
    bbox = [resource.native_bbox[0], resource.native_bbox[1], resource.native_bbox[2], resource.native_bbox[3]]
    layer, created = Layer.objects.get_or_create(name=resource.name, defaults={
        "workspace": resource.workspace.name,
        "store": resource.store.name,
        "storeType": resource.store.resource_type,
        "typename": "%s:%s" % (resource.workspace.name, resource.name),
        "title": resource.title or 'No title provided',
        "abstract": resource.abstract or _('No abstract provided'),
        "owner": request.user,
        "uuid": str(uuid.uuid4()),
        "bbox_polygon": Polygon.from_bbox(bbox),
    })
    layer.save()
    perms = {u'users': {u'AnonymousUser': [], request.user: [u'view_resourcebase', u'download_resourcebase', u'change_resourcebase_metadata', u'change_layer_data', u'change_layer_style', u'change_resourcebase', u'delete_resourcebase', u'change_resourcebase_permissions', u'publish_resourcebase']}, u'groups': {}}
    layer.set_permissions(perms)

def get_access_token(request): 
    return request.session['access_token'] if 'access_token' in request.session else None


@login_required
def generate_layer(request):
    '''
    # if user has permissions
    1. Create a layer in geoserver using:
        . PointLayer, PolygonLayer, Attribute to make statistcis & new LayerName
        . xml generated from 'wps builder gui'
        . headers
        . requests.request() which accepts request methods in addition to all of the above

    # if the layer successfuly created in geoserver
    2. get the layer from geoserver and pass it to > update_geonode()

    # if the layer updated in geonode
    3. return json success or failure
    '''

    response = ''
    geoserver_url = ogc_server_settings.LOCATION

    if request.method == "POST":
        distance = request.POST['distance']
        layer = request.POST['layer']
        new_layer_name = request.POST["newLayerName"]

        # check if user has permission to perform this method on geonode
        qs = _get_permitted_queryset(request, 'base.view_resourcebase')
        if not qs.filter(typename__exact=layer):
            return JsonResponse({"error": "permission error"}, status=405)

        access_token = get_access_token(request) 
        url = geoserver_url + "wps" if not access_token else geoserver_url + "wps" + "?access_token=%s"%(access_token)

        payload = """
        <p0:Execute
          xmlns:p0="http://www.opengis.net/wps/1.0.0"
          xmlns:geonode="http://www.geonode.org/" service="WPS" version="1.0.0">
          <p1:Identifier
            xmlns:p1="http://www.opengis.net/ows/1.1">gs:Import
          </p1:Identifier>
          <p0:DataInputs>
            <p0:Input>
              <p1:Identifier
                xmlns:p1="http://www.opengis.net/ows/1.1">features
              </p1:Identifier>
              <p0:Reference p4:href="http://geoserver/wps"
                xmlns:p4="http://www.w3.org/1999/xlink" method="POST" mimeType="text/xml; subtype=wfs-collection/1.0">
                <p0:Body>
                  <p0:Execute service="WPS" version="1.0.0">
                    <p1:Identifier
                      xmlns:p1="http://www.opengis.net/ows/1.1">gs:BufferFeatureCollection
                    </p1:Identifier>
                    <p0:DataInputs>
                      <p0:Input>
                        <p1:Identifier
                          xmlns:p1="http://www.opengis.net/ows/1.1">features
                        </p1:Identifier>
                        <p0:Reference p3:href="http://geoserver/wfs"
                          xmlns:p3="http://www.w3.org/1999/xlink" method="POST" mimeType="text/xml">
                          <p0:Body>
                            <p2:GetFeature
                              xmlns:p2="http://www.opengis.net/wfs" service="WFS" version="1.1.0" outputFormat="GML2">
                              <p2:Query typeName="{}" />
                            </p2:GetFeature>
                          </p0:Body>
                        </p0:Reference>
                      </p0:Input>
                      <p0:Input>
                        <p1:Identifier
                          xmlns:p1="http://www.opengis.net/ows/1.1">distance
                        </p1:Identifier>
                        <p0:Data>
                          <p0:LiteralData>{}</p0:LiteralData>
                        </p0:Data>
                      </p0:Input>
                    </p0:DataInputs>
                    <p0:ResponseForm>
                      <p0:RawDataOutput>
                        <p1:Identifier
                          xmlns:p1="http://www.opengis.net/ows/1.1">result
                        </p1:Identifier>
                      </p0:RawDataOutput>
                    </p0:ResponseForm>
                  </p0:Execute>
                </p0:Body>
              </p0:Reference>
            </p0:Input>
            <p0:Input>
              <p1:Identifier
                xmlns:p1="http://www.opengis.net/ows/1.1">workspace
              </p1:Identifier>
              <p0:Data>
                <p0:LiteralData>{}</p0:LiteralData>
              </p0:Data>
            </p0:Input>
            <p0:Input>
              <p1:Identifier
                xmlns:p1="http://www.opengis.net/ows/1.1">store
              </p1:Identifier>
              <p0:Data>
                <p0:LiteralData>{}</p0:LiteralData>
              </p0:Data>
            </p0:Input>
            <p0:Input>
              <p1:Identifier
                xmlns:p1="http://www.opengis.net/ows/1.1">name
              </p1:Identifier>
              <p0:Data>
                <p0:LiteralData>{}</p0:LiteralData>
              </p0:Data>
            </p0:Input>
          </p0:DataInputs>
          <p0:ResponseForm>
            <p0:RawDataOutput>
              <p1:Identifier
                xmlns:p1="http://www.opengis.net/ows/1.1">layerName
              </p1:Identifier>
            </p0:RawDataOutput>
          </p0:ResponseForm>
        </p0:Execute>
        """.format(layer, distance, settings.DEFAULT_WORKSPACE, default_store, new_layer_name)

        headers = {
            'content-type': "application/xml",
            'cache-control': "no-cache",
        }

        response = requests.request(
            "POST", url=url, data=payload, headers=headers)
        response_layer_name = response.text.split(':').pop(1)
        if response_layer_name == new_layer_name:
            gs_layer = gs_catalog.get_layer(response_layer_name)
            resource = gs_layer.resource
            type_name = "%s:%s" % (resource.workspace.name, resource.name)
            update_geonode(request, resource)
            return JsonResponse({'type_name': type_name, 'success': True}, status=200)
        else:
            return JsonResponse({'success': False, 'server_response': response.text}, status=500)
