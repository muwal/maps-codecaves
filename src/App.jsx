import React, { Fragment, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { GoogleMap, useLoadScript, Marker, MarkerF, InfoWindowF, PolygonF } from '@react-google-maps/api';
import { Card, CardBody, CardHeader, CardTitle, Col, Container, Row } from 'reactstrap';
import { MapContainer, Polygon, Popup, TileLayer } from 'react-leaflet';
import { Chart } from 'react-google-charts';
import "leaflet/dist/leaflet.css";
import axios from 'axios';

const libraries = ['places', 'geometry', 'geocoding'];
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

const indonesiaBoundary = [
    { lat: 5.903658, lng: 95.316635 }, // Northern point near Banda Aceh
    { lat: -10.171656, lng: 123.607032 }, // Southern point near Kupang
    { lat: -7.797068, lng: 110.370529 }, // Point in Central Java (Yogyakarta)
    { lat: -8.409518, lng: 115.188919 }, // Point in Bali
];

const centerJkt = {
    lat: -6.5962986, // Centered in Jakarta, Indonesia
    lng: 106.7972421,
}

const data = [
    ['City', 'Population', 'Area Percentage'],
    ['Banjarmasin', 855875, 118.9],
    ['Wamena', 655875, 158.9],
    ['Surabaya', 607906, 243.60],
    ['Palembang', 380181, 140.7],
    ['Ciawi', 371282, 102.41],
    ['Bogor', 67370, 949.3],
    ['Jakarta', 52192, 662.33],
    ['Sidoarjo', 38262, 20],
    ['Bandung', 89829, 167.31]
];

const kordinat = [
    [106.83899688720703, -6.639863014221191],
    [106.83867645263672, -6.637768745422363],
    [106.83882141113281, -6.635529041290283], [106.83934020996094, -6.6333088874816895], [106.83716583251953, -6.631610870361328], [106.83637237548828, -6.629660606384277], [106.83577728271484, -6.627737998962402], [106.83133697509766, -6.624757766723633], [106.8280029296875, -6.625190734863281], [106.82528686523438, -6.6251373291015625], [106.82456970214844, -6.620075702667236], [106.8245620727539, -6.619405269622803], [106.82454681396484, -6.617537021636963], [106.82394409179688, -6.61343240737915], [106.82247161865234, -6.610204219818115], [106.82195281982422, -6.608237266540527], [106.82195281982422, -6.60402774810791], [106.82186889648438, -6.601589679718018], [106.82049560546875, -6.597458362579346], [106.82083129882812, -6.59391450881958], [106.82228088378906, -6.591196537017822], [106.82379913330078, -6.5928544998168945], [106.82644653320312, -6.5929999351501465], [106.82804107666016, -6.591115951538086], [106.82914733886719, -6.587866306304932], [106.82959747314453, -6.585256576538086], [106.83036041259766, -6.58339786529541], [106.83141326904297, -6.580841541290283], [106.83091735839844, -6.57552433013916], [106.83151245117188, -6.570508003234863], [106.83209228515625, -6.567763805389404], [106.83219909667969, -6.564088344573975], [106.83143615722656, -6.561121463775635], [106.83048248291016, -6.558824062347412], [106.83006286621094, -6.556789398193359], [106.82929229736328, -6.5526533126831055], [106.8284683227539, -6.550354957580566], [106.82703399658203, -6.5472259521484375], [106.82861328125, -6.542497634887695], [106.82801055908203, -6.539834976196289], [106.82553100585938, -6.539621353149414], [106.8233871459961, -6.539237976074219], [106.82209014892578, -6.536876678466797], [106.81929016113281, -6.538269519805908], [106.81723022460938, -6.539689540863037], [106.81320190429688, -6.538452625274658], [106.81028747558594, -6.537741661071777], [106.80746459960938, -6.537063121795654], [106.80474853515625, -6.536016464233398], [106.80159759521484, -6.532533168792725], [106.80172729492188, -6.530087471008301], [106.80098724365234, -6.525077819824219], [106.80065155029297, -6.525749206542969], [106.79998016357422, -6.526414394378662], [106.79931640625, -6.527419090270996], [106.79896545410156, -6.528090000152588], [106.79864501953125, -6.529094219207764], [106.79864501953125, -6.529759883880615], [106.79896545410156, -6.530764102935791], [106.79864501953125, -6.531103134155273], [106.7979736328125, -6.531768321990967], [106.79663848876953, -6.531768321990967], [106.7952880859375, -6.530764102935791], [106.79395294189453, -6.530430793762207], [106.79296112060547, -6.529427528381348], [106.79178619384766, -6.5287957191467285], [106.7905044555664, -6.526711940765381], [106.78961181640625, -6.523946285247803], [106.78888702392578, -6.5209455490112305], [106.78839111328125, -6.517367362976074], [106.78459167480469, -6.517756938934326], [106.7842788696289, -6.517789363861084], [106.78056335449219, -6.519070148468018], [106.7784194946289, -6.519066333770752], [106.77751922607422, -6.5188493728637695], [106.77595520019531, -6.51846981048584], [106.77339172363281, -6.517709255218506], [106.77171325683594, -6.516554355621338], [106.76996612548828, -6.51530122756958], [106.7681655883789, -6.517373561859131], [106.76693725585938, -6.52216100692749], [106.76696014404297, -6.525167465209961], [106.76728820800781, -6.528204917907715], [106.76747131347656, -6.5302414894104], [106.76596069335938, -6.533527851104736], [106.7667465209961, -6.535459041595459], [106.76753997802734, -6.538225173950195], [106.7673568725586, -6.540532112121582], [106.76647186279297, -6.542710781097412], [106.76376342773438, -6.542665958404541], [106.7623062133789, -6.544582366943359], [106.76146697998047, -6.546383380889893], [106.76092529296875, -6.5475335121154785], [106.75973510742188, -6.549213409423828], [106.75776672363281, -6.550754070281982], [106.75560760498047, -6.552287578582764], [106.7540512084961, -6.554337978363037], [106.75215911865234, -6.5566253662109375], [106.74943542480469, -6.559464454650879], [106.74854278564453, -6.560396671295166], [106.74527740478516, -6.5620269775390625], [106.74195098876953, -6.564760208129883], [106.74368286132812, -6.567118167877197], [106.74417114257812, -6.569586277008057], [106.74440002441406, -6.573058605194092], [106.74434661865234, -6.576042652130127], [106.7481460571289, -6.576368808746338], [106.75081634521484, -6.575979232788086], [106.75068664550781, -6.577578067779541], [106.75035858154297, -6.5793232917785645], [106.74913024902344, -6.581637382507324], [106.74750518798828, -6.585081577301025], [106.74699401855469, -6.586381435394287], [106.74651336669922, -6.5885162353515625], [106.7454833984375, -6.5916523933410645], [106.7450942993164, -6.592785835266113], [106.74462127685547, -6.595632553100586], [106.74462890625, -6.597956657409668], [106.74675750732422, -6.598429203033447], [106.74940490722656, -6.598775386810303], [106.75204467773438, -6.598152160644531], [106.75313568115234, -6.596405982971191], [106.75263214111328, -6.592434883117676], [106.75251007080078, -6.590297698974609], [106.75355529785156, -6.586881637573242], [106.75782012939453, -6.588383197784424], [106.75973510742188, -6.58957052230835], [106.76072692871094, -6.590997219085693], [106.7618408203125, -6.592593193054199], [106.76399993896484, -6.595148086547852], [106.76545715332031, -6.596906661987305], [106.76677703857422, -6.599167346954346], [106.76990509033203, -6.60051155090332], [106.76984405517578, -6.6006693840026855], [106.77204895019531, -6.600794792175293], [106.77494049072266, -6.602241039276123], [106.7745132446289, -6.604612350463867], [106.77276611328125, -6.606568336486816], [106.77346801757812, -6.610270977020264], [106.77648162841797, -6.610313415527344], [106.77735137939453, -6.612532615661621], [106.77750396728516, -6.612910747528076], [106.77799224853516, -6.614490985870361], [106.77812957763672, -6.614943504333496], [106.77825927734375, -6.618617057800293], [106.78167724609375, -6.62339973449707], [106.78199768066406, -6.624278545379639], [106.78277587890625, -6.626397609710693], [106.7839126586914, -6.62989616394043], [106.7850112915039, -6.633194923400879], [106.78667449951172, -6.636279106140137], [106.78565216064453, -6.638082027435303], [106.7839126586914, -6.640274524688721], [106.78153991699219, -6.642753601074219], [106.78028869628906, -6.6446638107299805], [106.77800750732422, -6.646972179412842], [106.77630615234375, -6.6483941078186035], [106.77826690673828, -6.651390552520752], [106.77991485595703, -6.652613162994385], [106.78197479248047, -6.6544671058654785], [106.78417205810547, -6.657288551330566], [106.78463745117188, -6.660425186157227], [106.78764343261719, -6.659799098968506], [106.79048156738281, -6.659275054931641], [106.79268646240234, -6.658889293670654], [106.79502868652344, -6.658469200134277], [106.79796600341797, -6.657242774963379], [106.80029296875, -6.65541934967041], [106.80305480957031, -6.654529571533203], [106.80284118652344, -6.657312870025635], [106.80342102050781, -6.660139083862305], [106.80460357666016, -6.662210941314697], [106.80562591552734, -6.663530349731445], [106.80769348144531, -6.6652655601501465], [106.80950927734375, -6.666483402252197], [106.81227111816406, -6.668174743652344], [106.81352233886719, -6.6698102951049805], [106.8164291381836, -6.671698570251465], [106.81842041015625, -6.673379421234131], [106.82083129882812, -6.6745123863220215], [106.82315063476562, -6.674811840057373], [106.82533264160156, -6.674814701080322], [106.82778930664062, -6.674129962921143], [106.82879638671875, -6.674161911010742], [106.82959747314453, -6.674572944641113], [106.83080291748047, -6.675529956817627], [106.831298828125, -6.6766228675842285], [106.8311996459961, -6.677116870880127], [106.83480072021484, -6.675483226776123], [106.83719635009766, -6.673993110656738], [106.83889770507812, -6.671907901763916], [106.8395004272461, -6.669930934906006], [106.84020233154297, -6.667720794677734], [106.84056854248047, -6.664975166320801], [106.84058380126953, -6.6648454666137695], [106.84088134765625, -6.662330150604248], [106.84249114990234, -6.6575798988342285], [106.84323120117188, -6.655869483947754], [106.84551239013672, -6.650906562805176], [106.84369659423828, -6.648443222045898], [106.84251403808594, -6.646966934204102], [106.84114074707031, -6.645196437835693], [106.84032440185547, -6.644081115722656], [106.8401870727539, -6.643589019775391], [106.83956146240234, -6.642324447631836], [106.83927917480469, -6.64105749130249], [106.83899688720703, -6.639863014221191]]

const api_key = import.meta.env.VITE_GOOGLE_API_KEY

const getCoordinates = async (district) => {
    try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
            params: {
                address: district,
                key: api_key
            }
        });

        if (response.data.status !== 'OK' || !response.data.results.length) {
            throw new Error(`Geocoding API error: ${response.data.status}`);
        }

        const { lat, lng } = response.data.results[0].geometry.location;
        return { lat, lng };
    } catch (error) {
        console.error("Error fetching coordinates: ", error);
        return null;
    }
};

const placeName = 'Depok, West Java, Indonesia';


const App = () => {

    const [showPopup, setShowPopup] = useState(false); // State to toggle popup
    const [hovered, setHovered] = useState(false);     // State for hover effect

    const { isLoaded, loadError } = useLoadScript({
        id: 'google-map-script',
        googleMapsApiKey: api_key,
        libraries,
    });

    const [coordinatess, setCoordinatess] = useState([]);
    const [loading, setLoading] = useState(true);
    // const [map, setMap] = useState(null)
    // const [activeMarker, setActiveMarker] = useState(null);
    // const [coordinates, setCoordinates] = useState(
    //     dataPolygon.map((row) => [row.lat, row.lng])
    // );

    // const handleActiveMarker = (marker) => {
    //     if (marker === activeMarker) {
    //         return;
    //     }
    //     setActiveMarker(marker);
    // };

    const onLoad = useCallback(function callback(map) {
        const bounds = new window.google.maps.LatLngBounds(centerJkt);
        map.fitBounds(bounds);

        setMap(map)
    }, [])

    const onUnmount = useCallback(function callback(map) {
        setMap(null)
    }, [])

    // const handleMapIdle = () => {
    //     setActiveMarker(1)
    // }

    // if (loadError) {
    //     return <div>Error loading maps</div>;
    // }

    // if (!isLoaded) {
    //     return <div>Loading maps</div>;
    // }


    useEffect(() => {

        const fetchCoordinatesBoundaries = async () => {
            try {
                const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                    params: {
                        q: placeName,
                        format: 'json',
                        polygon_geojson: 1
                    }
                });

                if (response.data.length > 0) {
                    const geojsonPolygon = response.data[0].geojson.type === 'Polygon' ? response.data[0].geojson : [];
                    console.log('data', response.data);
                    console.log(geojsonPolygon);
                    const mainPolygon = geojsonPolygon.coordinates[0] || []; // The outer boundary (index 0)
                    const excludedPolygon = geojsonPolygon.coordinates[1] || []; // The hole (index 1, if available)

                    // Combine the two as one array for Leaflet Polygon with exclusion
                    setCoordinatess([mainPolygon, excludedPolygon]);
                    console.log(coordinatess);
                } else {
                    console.log('Place not found');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchCoordinatesBoundaries();

        const fetchCoordinates = async () => {
            const districts = ['Bogor Timur', 'Bogor Tengah', 'Bogor Barat', 'Bogor Selatan', 'Bogor Utara'];
            const coords = await Promise.all(districts.map(district => getCoordinates(district)));
            console.log(coords)
            // setCoordinatess(coords.filter(coord => coord !== null));
            setLoading(false);
        };

        fetchCoordinates();
    }, []);


    if (loading) {
        return <div>Loading...</div>;
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
                                {/* {isLoaded ? (
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
                                ) : null} */}
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
                                <MapContainer center={centerJkt} zoom={13} style={{ height: "600px", width: "100%" }} bounds={onload}>
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    {coordinatess.length > 0 && (
                                        <Polygon

                                            // positions={[
                                            //     ...coordinatess.map(coord => [coord.lat, coord.lng])
                                            // ]}
                                            // positions={coordinatess.map(coord => ({
                                            //     lng: coord[0],
                                            //     lat: coord[1]
                                            // }))}
                                            positions={coordinatess.length > 0 ? coordinatess.map(polygon => polygon.map(coord => [coord[1], coord[0]])) : []}  // Convert from [lng, lat] to [lat, lng]

                                            pathOptions={{ color: hovered ? 'green' : 'blue', fillColor: 'lightblue', fillOpacity: 0.5 }}
                                            color="blue"
                                            fillColor="lightblue"
                                            fillOpacity={0.5}
                                            eventHandlers={{
                                                click: () => {
                                                    setShowPopup(true);
                                                },
                                                mouseover: () => {
                                                    setHovered(true);
                                                },
                                                mouseout: () => {
                                                    setHovered(false);
                                                }
                                            }}
                                        >
                                            {/* Popup for displaying details */}
                                            {showPopup && (
                                                <Popup>
                                                    <div>
                                                        <h5>Polygon Details</h5>
                                                        <p>Coordinates: {placeName}</p>
                                                    </div>
                                                </Popup>
                                            )}
                                        </Polygon>
                                    )}
                                </MapContainer>

                                {/* {coordinates.length && (
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
                                )} */}
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
                                Geo Chart Maps
                            </CardTitle>
                        </CardHeader>
                        <CardBody>
                            <div>
                                <Chart
                                    chartEvents={[
                                        {
                                            eventName: "select",
                                            callback: ({ chartWrapper }) => {
                                                const chart = chartWrapper.getChart();
                                                const selection = chart.getSelection();
                                                if (selection.length === 0) return;
                                                const region = data[selection[0].row + 1];
                                                console.log("Selected : " + region);
                                            },
                                        },
                                    ]}
                                    chartType="GeoChart"
                                    width="100%"
                                    height="400px"
                                    data={data}
                                    options={{
                                        region: "ID",
                                        displayMode: "markers",
                                        sizeAxis: { minValue: 0, maxValue: 100 },
                                        resolution: "provinces",

                                    }}
                                    mapsApiKey={api_key}
                                />
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Fragment>
    );
};

export default memo(App);