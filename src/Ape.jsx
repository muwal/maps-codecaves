import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, useMapEvent } from 'react-leaflet';
import axios from 'axios';

const placeName = [
    "Kabupaten Poso, Sulawesi Tengah, Indonesia",
    "Kabupaten Banggai, Sulawesi Tengah, Indonesia",
    "Kabupaten Banggai Kepulauan",
    "Banggai Laut",
    "Tojo Una-Una",
    "Morowali, Central Sulawesi, Sulawesi, 94973, Indonesia",
    "Morowali Utara, Central Sulawesi, Sulawesi, 94971, Indonesia",
    "Kabupaten Morowali Utara, Sulawesi Tengah, Indonesia",
];

function MyMap() {
    const [coordinatess, setCoordinatess] = useState([]);
    const [placeNames, setPlaceNames] = useState([]);
    const [loading, setLoading] = useState(true);
    // Removed hovered state as it is not used
    const [clicked, setClicked] = useState(null);
    const [centerBounds, setCenterBounds] = useState([]);

    const fetchCoordinatesBoundaries = async () => {
        try {
            const fetchPromises = placeName.map(place =>
                axios.get('https://nominatim.openstreetmap.org/search', {
                    params: {
                        q: place,
                        format: 'json',
                        polygon_geojson: 1,
                        limit: 10
                    }
                })
            );

            const responses = await Promise.allSettled(fetchPromises);

            const allPolygons = [];
            const allPlacesName = [];
            const allBounds = [];

            responses.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    const response = result.value.data;

                    if (response.length > 0) {
                        const geojsonPolygon = response[0].geojson;

                        if (geojsonPolygon && (geojsonPolygon.type === 'Polygon' || geojsonPolygon.type === 'MultiPolygon')) {
                            const coordinates = geojsonPolygon.type === 'Polygon'
                                ? [geojsonPolygon.coordinates[0]]
                                : geojsonPolygon.coordinates.map(polygon => polygon[0]);

                            coordinates.forEach(coord => {
                                allPolygons.push(coord);
                                allPlacesName.push(response[0].display_name || placeName[index]);
                                allBounds.push(response[0].boundingbox);
                            });
                        }

                        console.info(response);
                    } else {
                        console.warn(`Place not found: ${placeName[index]}`);
                    }
                } else {
                    console.error(`Failed to fetch data for: ${placeName[index]}`, result.reason);
                }
            });

            const bounds = allBounds.map(bound => [
                [parseFloat(bound[0]), parseFloat(bound[2])],
                [parseFloat(bound[1]), parseFloat(bound[3])]
            ]);

            setCenterBounds(bounds);
            setCoordinatess(allPolygons); // Store all polygons
            setPlaceNames(allPlacesName);
            setLoading(false); // Set loading to false once all data is fetched
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false); // Always set loading to false after processing
        }
    };

    // Fetch coordinates for each place in the placeName array
    useEffect(() => {
        if (placeName.length > 0) {
            fetchCoordinatesBoundaries().then(() => setLoading(false));
        }
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    const MapClickHandler = () => {
        useMapEvent({
            click: () => {
                setClicked(null);
            }
        });
        return null;
    }


    return (
        <MapContainer
            bounds={centerBounds.length > 0 ? centerBounds : undefined}
            // bounds={centerBounds}
            zoom={12}
            style={{ height: "600px", width: "100%" }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapClickHandler />
            {/* Iterate over the polygons and display them */}
            {coordinatess.length > 0 && coordinatess.map((polygon, index) => (
                <Polygon
                    key={index}
                    positions={polygon.map(coord => [coord[1], coord[0]])} // Convert from [lng, lat] to [lat, lng]
                    pathOptions={{
                        color: clicked == index ? 'blue' : 'white',
                        fillColor: clicked == index ? 'blue' : 'lightblue',
                        fillOpacity: clicked != index ? 0.5 : 0.8
                    }}

                    eventHandlers={{
                        click: () => {
                            setClicked(index);
                        },
                    }}
                >
                    {/* {clicked[index] && ( */}
                    <Popup>
                        <div style={{ textAlign: "center" }}>
                            <h5 className='mb-0'>321</h5>
                            <p className='m-0'>{placeNames[index]}</p>
                        </div>
                    </Popup>
                    {/* )} */}
                </Polygon>
            ))
            }
        </MapContainer>
    );
}

export default (MyMap);
