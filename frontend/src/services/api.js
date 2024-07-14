const config = require('../config/config');
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const api = axios.create({
    baseURL: API_URL,
});

export const fetchBirthData = async () => {
    try {
        const response = await api.get('/api/birth-data');
        return response.data;
    } catch (error) {
        console.error('Error fetching birth data:', error);
        throw error;
    }
};

export const updateBirthData = async () => {
    try {
        const response = await api.get('/api/birth-data/update');
        return response.data;
    } catch (error) {
        console.error('Error updating birth data:', error);
        throw error;
    }
};

export const fetchMunicipalitiesGeoJSON = async () => {
    try {
        const response = await api.get('/api/municipalities');
        return response.data;
    } catch (error) {
        console.error('Error fetching municipalities GeoJSON:', error);
        throw error;
    }
};

export default api;
