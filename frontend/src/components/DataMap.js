import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import axios from 'axios';
import PropTypes from 'prop-types';
import 'leaflet/dist/leaflet.css';
import * as d3 from 'd3';

function DataMap({ data }) {
    const [geoJsonData, setGeoJsonData] = useState(null);

    useEffect(() => {
        const fetchGeoJson = async () => {
            try {
                const response = await axios.get('http://localhost:5001/api/municipalities');
                console.log('GeoJSON data:', response.data);
                setGeoJsonData(response.data);
            } catch (error) {
                console.error('Error fetching GeoJSON:', error);
            }
        };
        fetchGeoJson();
    }, []);

    const colorScale = d3.scaleQuantize()
        .domain([0, 1000])
        .range(['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026']);

    const getColor = useCallback((value) => {
        return colorScale(value);
    }, [colorScale]);

    const style = useCallback((feature) => {
        const municipalityData = data.find(d => d.municipalityCode === feature.properties.id);
        const totalBirths = municipalityData ? municipalityData.value : 0;
        return {
            fillColor: getColor(totalBirths),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }, [data, getColor]);

    const onEachFeature = useCallback((feature, layer) => {
        const municipalityData = data.find(d => d.municipalityCode === feature.properties.id);
        if (municipalityData) {
            layer.bindTooltip(`
            <strong>${feature.properties.kom_namn}</strong><br>
            Total Births: ${municipalityData.value}<br>
            Year: ${municipalityData.year}
        `);
        } else {
            console.log('No birth data for municipality:', feature.properties.kom_namn);
        }
    }, [data]);

    if (!geoJsonData) {
        return <div>Loading map data...</div>;
    }

    return (
        <div style={{ height: '500px', width: '100%' }}>
            <MapContainer center={[62.5, 15]} zoom={4} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {geoJsonData && <GeoJSON data={geoJsonData} style={style} onEachFeature={onEachFeature} />}
            </MapContainer>
        </div>
    );
}

DataMap.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        municipalityCode: PropTypes.string.isRequired,
        municipalityName: PropTypes.string.isRequired,
        year: PropTypes.string.isRequired,
        gender: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired
    })).isRequired
};

export default DataMap;
