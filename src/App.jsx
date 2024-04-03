import React, { Fragment, memo, useCallback, useEffect, useState } from 'react';
import { GoogleMap, useLoadScript, Marker, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { Card, CardBody, CardHeader, CardTitle, Col, Container, Row } from 'reactstrap';
import { MapContainer, Polygon, TileLayer } from 'react-leaflet';
import "leaflet/dist/leaflet.css";

const libraries = ['places'];
const mapContainerStyle = {
    width: '100%',
    height: '600px',
};

const center = { lat: -6.273003278562657, lng: 106.71375649335793 }
const dataPolygon = [
    {
        "lat": -6.272987045801549,
        "lng": 106.71286439762896
    },
    {
        "lat": -6.2721498742008635,
        "lng": 106.71426451076354
    },
    {
        "lat": center.lat,
        "lng": center.lng
    }
];


const App = () => {
    const { isLoaded, loadError } = useLoadScript({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY,
        libraries,
    });

    const [map, setMap] = useState(null)
    const [activeMarker, setActiveMarker] = useState(null);
    const [coordinates, setCoordinates] = useState(
        dataPolygon.map((row) => [row.lat, row.lng])
    );

    const handleActiveMarker = (marker) => {
        if (marker === activeMarker) {
            return;
        }
        setActiveMarker(marker);
    };

    const onLoad = useCallback(function callback(map) {
        const bounds = new window.google.maps.LatLngBounds(center);
        map.fitBounds(bounds);

        setMap(map)
    }, [])

    const onUnmount = useCallback(function callback(map) {
        setMap(null)
    }, [])

    const handleMapIdle = () => {
        setActiveMarker(1)
    }

    if (loadError) {
        return <div>Error loading maps</div>;
    }

    if (!isLoaded) {
        return <div>Loading maps</div>;
    }

    return (
        <Fragment>
            <Row className='m-5'>
                <Col md={12}>
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Maps
                            </CardTitle>
                        </CardHeader>
                        <CardBody>
                            <div>
                                {isLoaded ? (
                                    <GoogleMap
                                        center={center}
                                        options={{ zoom: 18 }}
                                        onClick={() => setActiveMarker(null)}
                                        mapContainerStyle={mapContainerStyle}
                                        onLoad={onLoad}
                                        onUnmount={onUnmount}
                                    // onIdle={handleMapIdle}
                                    >
                                        <MarkerF
                                            position={center}
                                            onClick={() => handleActiveMarker(1)}
                                        >
                                            {activeMarker ? (
                                                <InfoWindowF onCloseClick={() => setActiveMarker(null)}>
                                                    <div id='content'>
                                                        <h5 style={{ margin: 0, marginBottom: 5 }}>Jejakin - Codecaves</h5>
                                                        <small>Environmental engineer</small>
                                                        <p>
                                                            Kebayoran Square A08 <br />Pondok Jaya <br /> Pondok Aren <br />South Tangerang City<br />Banten
                                                        </p>
                                                        <a href='https://maps.app.goo.gl/qeoQtHvM9q1C5BnZ7' target='_blank'>
                                                            <span>
                                                                View on Google Maps
                                                            </span>
                                                        </a>
                                                    </div>
                                                </InfoWindowF>
                                            ) : null}
                                        </MarkerF>
                                    </GoogleMap>
                                ) : null}
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
            <Row className='m-5'>
                <Col md={12}>
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Polygon Leaflet
                            </CardTitle>
                        </CardHeader>
                        <CardBody>
                            <div>
                                {coordinates.length && (
                                    <MapContainer
                                        style={mapContainerStyle}
                                        bounds={coordinates}
                                        boundsOptions={{ padding: [1, 1] }}
                                        scrollWheelZoom={true}
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <Polygon positions={coordinates} />
                                    </MapContainer>
                                )}
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Fragment>
    );
};

export default memo(App);