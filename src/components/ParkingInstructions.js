import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, PermissionsAndroid, Image, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Icon, Button, Modal, Text, Card } from '@ui-kitten/components';
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  Polyline,
  Geojson,
} from 'react-native-maps';
import SnackBar from 'react-native-snackbar-component';
import Geolocation from '@react-native-community/geolocation';
import TopMenu from './TopMenu';
import { useStore } from '../contexts/StoreContext';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';
import { getParkingInstructions1, getParkingInstructions2, getParkingInstructions3, getParkingInstructions4 } from '../controllers/parkingInstructionsController';
import bar from '../assets/estacionamiento_via_publica.json';

const ParkingInstructions = ({ navigation }) => {
  const initialLocation = {
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
  };

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const [mapRegion, setMapRegion] = useState(initialLocation);
  const [modalInfo, setModalInfo] = useState({
    carBrand: '',
    carModel: '',
    carPlate: '',
    expiryTime: '',
    parkingId: '',
  });
  const [visibleModal, setVisibleModal] = useState(false);
  const [geojsonFeatures1, setGeojsonFeatures1] = useState([]);
  const [geojsonLoaded1, setGeojsonLoaded1] = useState(false);
  const [geojsonFeatures2, setGeojsonFeatures2] = useState([]);
  const [geojsonLoaded2, setGeojsonLoaded2] = useState(false);
  const [geojsonFeatures3, setGeojsonFeatures3] = useState([]);
  const [geojsonLoaded3, setGeojsonLoaded3] = useState(false);
  const [geojsonFeatures4, setGeojsonFeatures4] = useState([]);
  const [geojsonLoaded4, setGeojsonLoaded4] = useState(false);
  const { state, dispatch } = useStore();
  const mapRef = useRef();

  const renderLocationIcon = (props) => (
    <Icon {...props} name='navigation-2-outline' size='giant' />
  );

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Permisos de Localización',
          message:
            'Necesitamos permisos de localización para esta funcionalidad ',
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Permiso de localización obtenido exitosamente');
      } else {
        setError('No se tienen permisos de localización');
      }
    } catch (err) {
      alert(err);
    }
  };

  useEffect(async () => {
    try {
      await handleLocationButtonPress();
      //let geojsonChunk = [];
      let data = await getParkingInstructions1(0, 1000);
      setGeojsonFeatures1(data.result);
      setGeojsonLoaded1(true);
      let data2 = await getParkingInstructions2(0, 1000);
      setGeojsonFeatures2(data2.result);
      let data3 = await getParkingInstructions3(0, 1000);
      setGeojsonFeatures2(data3.result);
      let data4 = await getParkingInstructions3(0, 1000);
      setGeojsonFeatures2(data4.result);
      //setGeojsonLoaded2(true);
      /*let counter = 0;
            while(data.result.nextToIndex < 2001) {
                geojsonChunk.push(setGeojsonFeatures(geojsonChunk)geojson)
               counter += 1000
                console.log(counter)
                if(counter >= 5000) {
                    nextGeojson = geojsonFeatures.concat(geojsonChunk)
                    setGeojsonFeatures(nextGeojson)
                    counter = 0;
                }
                console.log(geojsonFeatures)
                setGeojsonFeatures(geojsonChunk)
                data = await getParkingInstructions(data.result.nextFromIndex, data.result.nextToIndex);
            }

            setGeojsonLoaded(true)
            geojsonFeatures.map(f => {
                console.log(f)
            })*/
    } catch (error) {
      console.log(error);
    }
  }, [currentUser]);

  const getPolylineCoords = (coordinates) => {
    let result = [];
    coordinates[0].map((c) => {
      const line = {
        longitude: c[0],
        latitude: c[1],
      };
      result.push(line);
    });
    console.log(result);
    return result;
  };

  const handleLocationButtonPress = async () => {
    const chckLocationPermission = PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    if (chckLocationPermission !== PermissionsAndroid.RESULTS.GRANTED) {
      await requestLocationPermission();
    }
    Geolocation.getCurrentPosition(
      (pos) => {
        const crd = pos.coords;
        const newRegion = {
          latitude: crd.latitude,
          longitude: crd.longitude,
          latitudeDelta: mapRegion.latitudeDelta,
          longitudeDelta: mapRegion.longitudeDelta,
        };
        setMapRegion(newRegion);
        mapRef.current.animateToRegion(newRegion);
      },
      (error) => alert(JSON.stringify(error)),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  return (
    <React.Fragment>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        showsMyLocationButton={true}
        initialRegion={initialLocation}
        showsPointsOfInterest={false}
        showsUserLocation={true}
        customMapStyle={[
          {
            featureType: 'poi.business',
            stylers: [
              {
                visibility: 'off',
              },
            ],
          },
          {
            featureType: 'poi.park',
            elementType: 'labels.text',
            stylers: [
              {
                visibility: 'off',
              },
            ],
          },
        ]}
        onRegionChangeComplete={(region) => setMapRegion(region)}
        ref={mapRef}
      >
        {/*testData.map(i => {
                <Polyline
                coordinates={getPolylineCoords(i.geometry.coordinates)}
                strokeColor="green"
                fillColor="green"
                strokeWidth={2}
            />
            })*/}
        {geojsonLoaded1 && geojsonFeatures1 && (
          <Geojson
            geojson={geojsonFeatures1}
            strokeColor='green'
            fillColor='green'
            strokeWidth={2}
          />
        )}
        {geojsonLoaded2 && geojsonFeatures2 && (
          <Geojson
            geojson={geojsonFeatures2}
            strokeColor='green'
            fillColor='green'
            strokeWidth={2}
          />
        )}
        {geojsonLoaded3 && geojsonFeatures3 && (
          <Geojson
            geojson={geojsonFeatures3}
            strokeColor='green'
            fillColor='green'
            strokeWidth={2}
          />
        )}
        {geojsonLoaded4 && geojsonFeatures4 && (
          <Geojson
            geojson={geojsonFeatures4}
            strokeColor='green'
            fillColor='green'
            strokeWidth={2}
          />
        )}
      </MapView>
      <TopMenu showMenu={() => navigation.toggleDrawer()} />
      <Button
        style={styles.locationButton}
        appearance='filled'
        status='primary'
        accessoryLeft={renderLocationIcon}
        onPress={() => handleLocationButtonPress()}
      />
      <SnackBar
        visible={message.length > 0}
        textMessage={message}
        actionHandler={() => {
          setMessage('');
        }}
        actionText='OK'
        autoHidingTime={5000}
      />
      <SnackBar
        visible={error.length > 0}
        textMessage={error}
        actionHandler={() => {
          setError('');
        }}
        actionText='OK'
        backgroundColor='#990000'
        accentColor='#ffffff'
        autoHidingTime={5000}
      />
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: 'transparent',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  locationButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 50,
    height: 50,
    lineHeight: 50,
    borderRadius: 50,
  },
  addButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 50,
    height: 50,
    lineHeight: 50,
    borderRadius: 50,
  },
  calloutBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  card: {
    flex: 1,
    margin: 2,
  },
  cardFooterContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cardFooterControl: {
    marginHorizontal: 2,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

const features = {
  type: 'FeatureCollection',
  name: 'estacionamiento_via_publica',
  crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
  features: [
    {
      type: 'Feature',
      properties: {
        id: 25728,
        calle: 'GODOY CRUZ',
        tipo_calle: 'CALLE',
        codigo_calle: '7054',
        id_eje: '4463',
        sm: '21-018',
        lado: 'derecho',
        altura: '2701 - 2799',
        paridad: 'IMPAR',
        regla_general_id: 2,
        regla_general: 'PERMITIDO ESTACIONAR',
        horario_regla_general_id: 1,
        horario_regla_general: '24 HORAS',
        normativa_id: null,
        normativa: null,
        horario_normativa_id: null,
        horario_normativa: null,
        tarifa: '',
      },
      geometry: {
        type: 'MultiLineString',
        coordinates: [
          [
            [-58.42511446006251, -34.578589796260104],
            [-58.424647634564472, -34.578079438969809],
            [-58.424393510213584, -34.577804669958319],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 25766,
        calle: 'GODOY CRUZ',
        tipo_calle: 'CALLE',
        codigo_calle: '7054',
        id_eje: '4151',
        sm: '21-054',
        lado: 'derecho',
        altura: '2901 - 2999',
        paridad: 'IMPAR',
        regla_general_id: 2,
        regla_general: 'PERMITIDO ESTACIONAR',
        horario_regla_general_id: 1,
        horario_regla_general: '24 HORAS',
        normativa_id: null,
        normativa: null,
        horario_normativa_id: null,
        horario_normativa: null,
        tarifa: '',
      },
      geometry: {
        type: 'MultiLineString',
        coordinates: [
          [
            [-58.423371848873593, -34.576685541697302],
            [-58.42239030425069, -34.575655506559031],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 25800,
        calle: 'GODOY CRUZ',
        tipo_calle: 'CALLE',
        codigo_calle: '7054',
        id_eje: '3680',
        sm: '21-094B',
        lado: 'derecho',
        altura: '3201 - 3299',
        paridad: 'IMPAR',
        regla_general_id: 2,
        regla_general: 'PERMITIDO ESTACIONAR',
        horario_regla_general_id: 1,
        horario_regla_general: '24 HORAS',
        normativa_id: null,
        normativa: null,
        horario_normativa_id: null,
        horario_normativa: null,
        tarifa: '',
      },
      geometry: {
        type: 'MultiLineString',
        coordinates: [
          [
            [-58.42114693436082, -34.573545601945426],
            [-58.420648040530999, -34.572654974531268],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 44883,
        calle: 'GODOY CRUZ',
        tipo_calle: 'CALLE',
        codigo_calle: '7054',
        id_eje: '3795',
        sm: '21-089',
        lado: 'derecho',
        altura: '3101 - 3199',
        paridad: 'IMPAR',
        regla_general_id: 2,
        regla_general: 'PERMITIDO ESTACIONAR',
        horario_regla_general_id: 1,
        horario_regla_general: '24 HORAS',
        normativa_id: null,
        normativa: null,
        horario_normativa_id: null,
        horario_normativa: null,
        tarifa: '',
      },
      geometry: {
        type: 'MultiLineString',
        coordinates: [
          [
            [-58.421636312524036, -34.574422665334851],
            [-58.421374529514864, -34.57395217137978],
            [-58.421254291686658, -34.573737477387972],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 44885,
        calle: 'GODOY CRUZ',
        tipo_calle: 'CALLE',
        codigo_calle: '7054',
        id_eje: '3944',
        sm: '21-084',
        lado: 'derecho',
        altura: '3001 - 3099',
        paridad: 'IMPAR',
        regla_general_id: 2,
        regla_general: 'PERMITIDO ESTACIONAR',
        horario_regla_general_id: 1,
        horario_regla_general: '24 HORAS',
        normativa_id: null,
        normativa: null,
        horario_normativa_id: null,
        horario_normativa: null,
        tarifa: '',
      },
      geometry: {
        type: 'MultiLineString',
        coordinates: [
          [
            [-58.422196315904671, -34.575423383950351],
            [-58.421741600204527, -34.574606256238631],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 46503,
        calle: 'GODOY CRUZ',
        tipo_calle: 'CALLE',
        codigo_calle: '7054',
        id_eje: '3680',
        sm: '21-095',
        lado: 'izquierdo',
        altura: '3202 - 3300',
        paridad: 'PAR',
        regla_general_id: 1,
        regla_general: 'PROHIBIDO ESTACIONAR',
        horario_regla_general_id: 1,
        horario_regla_general: '24 HORAS',
        normativa_id: 2,
        normativa: 'PERMITIDO ESTACIONAR',
        horario_normativa_id: 1,
        horario_normativa: '24 HORAS',
        tarifa: '',
      },
      geometry: {
        type: 'MultiLineString',
        coordinates: [
          [
            [-58.421240492271451, -34.573490113107987],
            [-58.420753561211498, -34.572620843429881],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 46607,
        calle: 'GODOY CRUZ',
        tipo_calle: 'CALLE',
        codigo_calle: '7054',
        id_eje: '4463',
        sm: '21-019',
        lado: 'izquierdo',
        altura: '2702 - 2800',
        paridad: 'PAR',
        regla_general_id: 1,
        regla_general: 'PROHIBIDO ESTACIONAR',
        horario_regla_general_id: 1,
        horario_regla_general: '24 HORAS',
        normativa_id: 2,
        normativa: 'PERMITIDO ESTACIONAR',
        horario_normativa_id: 1,
        horario_normativa: '24 HORAS',
        tarifa: '',
      },
      geometry: {
        type: 'MultiLineString',
        coordinates: [
          [
            [-58.425206984366753, -34.578533883394002],
            [-58.424740158615108, -34.578023526452718],
            [-58.424486034129586, -34.577748757631277],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 46612,
        calle: 'GODOY CRUZ',
        tipo_calle: 'CALLE',
        codigo_calle: '7054',
        id_eje: '4292',
        sm: '21-028',
        lado: 'izquierdo',
        altura: '2802 - 2900',
        paridad: 'PAR',
        regla_general_id: 1,
        regla_general: 'PROHIBIDO ESTACIONAR',
        horario_regla_general_id: 1,
        horario_regla_general: '24 HORAS',
        normativa_id: 2,
        normativa: 'PERMITIDO ESTACIONAR',
        horario_normativa_id: 1,
        horario_normativa: '24 HORAS',
        tarifa: '',
      },
      geometry: {
        type: 'MultiLineString',
        coordinates: [
          [
            [-58.424315000732122, -34.577565898265178],
            [-58.423658111240371, -34.576855813886425],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 46649,
        calle: 'GODOY CRUZ',
        tipo_calle: 'CALLE',
        codigo_calle: '7054',
        id_eje: '4151',
        sm: '21-055A',
        lado: 'izquierdo',
        altura: '2902 - 3000',
        paridad: 'PAR',
        regla_general_id: 1,
        regla_general: 'PROHIBIDO ESTACIONAR',
        horario_regla_general_id: 1,
        horario_regla_general: '24 HORAS',
        normativa_id: 2,
        normativa: 'PERMITIDO ESTACIONAR',
        horario_normativa_id: 1,
        horario_normativa: '24 HORAS',
        tarifa: '',
      },
      geometry: {
        type: 'MultiLineString',
        coordinates: [
          [
            [-58.423469012284457, -34.57663651279092],
            [-58.422487467037946, -34.575606478425286],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 46692,
        calle: 'GODOY CRUZ',
        tipo_calle: 'CALLE',
        codigo_calle: '7054',
        id_eje: '3944',
        sm: '21-085',
        lado: 'izquierdo',
        altura: '3002 - 3100',
        paridad: 'PAR',
        regla_general_id: 1,
        regla_general: 'PROHIBIDO ESTACIONAR',
        horario_regla_general_id: 1,
        horario_regla_general: '24 HORAS',
        normativa_id: 2,
        normativa: 'PERMITIDO ESTACIONAR',
        horario_normativa_id: 1,
        horario_normativa: '24 HORAS',
        tarifa: '',
      },
      geometry: {
        type: 'MultiLineString',
        coordinates: [
          [
            [-58.422296782230646, -34.57538394591144],
            [-58.421842065761417, -34.574566818568179],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 46695,
        calle: 'GODOY CRUZ',
        tipo_calle: 'CALLE',
        codigo_calle: '7054',
        id_eje: '3795',
        sm: '21-090',
        lado: 'izquierdo',
        altura: '3102 - 3200',
        paridad: 'PAR',
        regla_general_id: 1,
        regla_general: 'PROHIBIDO ESTACIONAR',
        horario_regla_general_id: 1,
        horario_regla_general: '24 HORAS',
        normativa_id: 2,
        normativa: 'PERMITIDO ESTACIONAR',
        horario_normativa_id: 1,
        horario_normativa: '24 HORAS',
        tarifa: '',
      },
      geometry: {
        type: 'MultiLineString',
        coordinates: [
          [
            [-58.421739311988887, -34.574377642593419],
            [-58.421477528540095, -34.573907148855426],
            [-58.421357290511686, -34.573692454963364],
          ],
        ],
      },
    },
  ],
};
export default ParkingInstructions;
