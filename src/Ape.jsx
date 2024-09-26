import React, { useState, useEffect, memo } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, useMapEvent } from 'react-leaflet';
import axios from 'axios';

const placeName = [
    "Kabupaten Poso, Sulawesi Tengah, Indonesia",
    "Kabupaten Banggai, Sulawesi Tengah, Indonesia",
    "Kabupaten Banggai Kepulauan",
    "Banggai Laut",
    "Tojo Una-Una",
    "Morowali, Central Sulawesi, Sulawesi, 94973, Indonesia",
    "Morowali Utara, Central Sulawesi, Sulawesi, 94971, Indonesia"
];

function MyMap() {
    const [coordinatess, setCoordinatess] = useState([]);
    const [placeNames, setPlaceNames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hovered, setHovered] = useState({}); // Track hovered state per polygon
    const [clicked, setClicked] = useState();

    const fetchCoordinatesBoundaries = async () => {
        try {
            const fetchPromises = placeName.map(place =>
                axios.get('https://nominatim.openstreetmap.org/search', {
                    params: {
                        q: place,
                        format: 'json',
                        polygon_geojson: 1,
                    },
                })
            );

            const responses = await Promise.allSettled(fetchPromises);

            const allPolygons = [];
            const allPlacesName = [];

            responses.forEach((result, index) => {
                console.log(result)
                if (result.status === 'fulfilled' || result.value.status === 200) {
                    const response = result.value.data;

                    // Check if data exists
                    if (response.length > 0) {
                        const geojsonPolygon = response[0].geojson;

                        // Process Polygon and MultiPolygon
                        if (geojsonPolygon && (geojsonPolygon.type === 'Polygon' || geojsonPolygon.type === 'MultiPolygon')) {
                            const coordinates = geojsonPolygon.type === 'Polygon'
                                ? [geojsonPolygon.coordinates[0]]
                                : geojsonPolygon.coordinates.map(polygon => polygon[0]);

                            coordinates.forEach(coord => {
                                allPolygons.push(coord);
                                allPlacesName.push(response[0].display_name || placeName[index]);
                            });
                        }
                    } else {
                        console.log(`Place not found: ${placeName[index]}`);
                    }
                } else {
                    console.error(`Failed to fetch data for: ${placeName[index]}`, result.reason);
                }
            });

            // // Loop through all place names and fetch their boundary data
            // for (let place of placeName) {
            //     const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
            //         params: {
            //             q: place,
            //             format: 'json',
            //             polygon_geojson: 1
            //         }
            //     });

            //     if (response.data.length > 0) {
            //         const geojsonPolygon = response.data[0].geojson;
            //         console.log(response.data);

            //         // Check if the response is valid and contains Polygon data
            //         if (geojsonPolygon && geojsonPolygon.type === 'Polygon') {
            //             const mainPolygon = geojsonPolygon.coordinates[0] || [];
            //             const placesNames = response.data[0].name || place;

            //             allPolygons.push(mainPolygon); // Add the polygon to the list
            //             allPlacesName.push(placesNames);
            //         } else if (geojsonPolygon && geojsonPolygon.type === 'MultiPolygon') {
            //             geojsonPolygon.coordinates.forEach(
            //                 polygon => {
            //                     allPolygons.push(polygon[0])
            //                     allPlacesName.push(place);
            //                 }
            //             ); // Handle MultiPolygon type
            //         }
            //     } else {
            //         console.log(`Place not found: ${place}`);
            //     }
            // }

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
            fetchCoordinatesBoundaries();
        }
    }, [placeName]);

    // Create a bounding box for all polygons
    function getBounds(coordinatess) {
        const lats = [];
        const lngs = [];

        coordinatess.forEach(polygon => {
            polygon.forEach(coord => {
                lats.push(coord[1]); // Latitude (index 1)
                lngs.push(coord[0]); // Longitude (index 0)
            });
        });

        const southWest = [Math.min(...lats), Math.min(...lngs)];
        const northEast = [Math.max(...lats), Math.max(...lngs)];

        return [southWest, northEast];
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    // Get bounds from the fetched coordinates
    const bounds = getBounds(coordinatess);

    const MapClickHandler = () => {
        useMapEvent({
            click: () => {
                setClicked(null);
            }
        });
        return null;
    };

    return (
        <MapContainer
            bounds={bounds}
            zoom={10}
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
                            // setClicked(prev => ({ ...prev, [index]: !prev[index] })); // Toggle clicked state for this polygon
                            setClicked(index);
                        },
                        mouseover: () => {
                            setHovered(prev => ({ ...prev, [index]: true })); // Set hovered state for this polygon
                        },
                        mouseout: () => {
                            setHovered(prev => ({ ...prev, [index]: false })); // Remove hovered state for this polygon
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
