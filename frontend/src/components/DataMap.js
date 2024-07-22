/**
 * @file DataMap.js
 * @description Komponent för att visa födelsedata på en interaktiv karta.
 * @requires React
 * @requires react-leaflet
 * @requires axios
 * @requires PropTypes
 * @requires leaflet/dist/leaflet.css
 * @requires d3
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import axios from 'axios';
import PropTypes from 'prop-types';
import 'leaflet/dist/leaflet.css';
import * as d3 from 'd3';

/**
 * @function DataMap
 * @description Renderar en interaktiv karta som visar födelsedata för svenska kommuner.
 *
 * @param {Object} props - Komponentens props
 * @param {Array<Object>} props.data - Array med födelsedata-objekt
 * @param {string} props.year - Valt år för att visa data
 * @param {Object|null} props.gender - Valt kön för att filtrera data (null om inget kön är valt)
 *
 * @returns {JSX.Element} Renderad DataMap-komponent
 */
function DataMap({ data, year, gender }) {
    /** @type {[Object|null, function]} GeoJSON-data och uppdateringsfunktion */
    const [geoJsonData, setGeoJsonData] = useState(null);

    /** @type {React.MutableRefObject} Referens till GeoJSON-lagret */
    const geoJsonLayerRef = useRef(null);

    /** @type {React.MutableRefObject} Referens till kartan */
    const mapRef = useRef(null);

    /**
     * @function
     * @description Hämtar GeoJSON-data för svenska kommuner från API:et
     */
    useEffect(() => {
        const fetchGeoJson = async () => {
            try {
                const response = await axios.get('http://localhost:5001/api/municipalities');
                console.log('GeoJSON-data hämtad:', response.data);
                setGeoJsonData(response.data);
            } catch (error) {
                console.error('Fel vid hämtning av GeoJSON:', error);
            }
        };
        fetchGeoJson();
    }, []);

    /**
     * @type {d3.ScaleQuantize<string, never>}
     * @description Färgskala för att representera födelsetal
     */
    const colorScale = d3.scaleQuantize()
        .domain([0, 1000])
        .range(['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026']);

    /**
     * @function getColor
     * @description Returnerar en färg baserad på antalet födslar
     *
     * @param {number} value - Antalet födslar
     * @returns {string} Hexadecimal färgkod
     */
    const getColor = useCallback((value) => {
        return colorScale(value);
    }, [colorScale]);

    /**
     * @function style
     * @description Definierar stilen för varje kommun på kartan
     *
     * @param {Object} feature - GeoJSON-feature för en kommun
     * @returns {Object} Stilobjekt för kommunen
     */
    const style = useCallback((feature) => {
        const municipalityData = data.find(d =>
            d.municipalityCode === feature.properties.id &&
            d.year === year &&
            (gender ? d.gender === gender.value : true)
        );
        const totalBirths = municipalityData ? municipalityData.value : 0;
        return {
            fillColor: getColor(totalBirths),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }, [data, year, gender, getColor]);

    /**
     * @function onEachFeature
     * @description Lägger till en tooltip för varje kommun på kartan
     *
     * @param {Object} feature - GeoJSON-feature för en kommun
     * @param {L.Layer} layer - Leaflet-lager för kommunen
     */
    const onEachFeature = useCallback((feature, layer) => {
        const municipalityData = data.find(d =>
            d.municipalityCode === feature.properties.id &&
            d.year === year &&
            (gender ? d.gender === gender.value : true)
        );
        if (municipalityData) {
            layer.bindTooltip(`
      <strong>${feature.properties.kom_namn}</strong><br>
      Antal födda: ${municipalityData.value}<br>
      År: ${year}<br>
      Kön: ${gender ? (gender.value === '1' ? 'Män' : 'Kvinnor') : 'Alla'}
    `);
        } else {
            console.log('Ingen födelsedata för kommun:', feature.properties.kom_namn);
        }
    }, [data, year, gender]);

    /**
     * @function MapUpdater
     * @description Uppdaterar kartan när data, år eller kön ändras
     *
     * @returns {null}
     */
    const MapUpdater = () => {
        const map = useMap();
        useEffect(() => {
            if (geoJsonLayerRef.current) {
                geoJsonLayerRef.current.clearLayers(); // Rensa befintliga lager
                geoJsonLayerRef.current.addData(geoJsonData); // Lägg till uppdaterad GeoJSON-data
                // Uppdatera stilen för varje kommun baserat på det nya året och/eller kön
                geoJsonLayerRef.current.eachLayer(layer => {
                    const feature = layer.feature;
                    const municipalityData = data.find(d =>
                        d.municipalityCode === feature.properties.id &&
                        d.year === year &&
                        (gender ? d.gender === gender.value : true)
                    );
                    const totalBirths = municipalityData ? municipalityData.value : 0;
                    layer.setStyle({
                        fillColor: getColor(totalBirths),
                        weight: 2,
                        opacity: 1,
                        color: 'white',
                        dashArray: '3',
                        fillOpacity: 0.7
                    });
                    if (municipalityData) {
                        layer.bindTooltip(`
                        <strong>${feature.properties.kom_namn}</strong><br>
                        Antal födda: ${municipalityData.value}<br>
                        År: ${year}<br>
                        Kön: ${gender ? (gender.value === '1' ? 'Män' : 'Kvinnor') : 'Alla'}
                    `);
                    }
                });
            }
            map.setView([62.5, 15], 4); // Återställer kartans vy om det behövs
        }, [year, geoJsonData, data, gender, getColor, map]);
        return null;
    };

    if (!geoJsonData) {
        return <div>Laddar kartdata...</div>;
    }

    return (
        <div style={{ height: '500px', width: '100%' }}>
            <MapContainer center={[62.5, 15]} zoom={4} style={{ height: '100%', width: '100%' }} ref={mapRef}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <GeoJSON
                    data={geoJsonData}
                    style={style}
                    onEachFeature={onEachFeature}
                    ref={geoJsonLayerRef}
                />
                <MapUpdater />
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
    })).isRequired,
    year: PropTypes.string.isRequired,
    gender: PropTypes.object
};

export default DataMap;
