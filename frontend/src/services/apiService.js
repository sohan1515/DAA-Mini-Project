import axios from 'axios';

const API = axios.create({ 
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
});

export const RouteAPI = {
  dijkstra: (from, to, wDist, wCrowd) =>
    API.post('/routes/dijkstra', { from, to, weightDist: wDist, weightCrowd: wCrowd }),

  floydWarshall: (wDist, wCrowd) =>
    API.post('/routes/floyd-warshall', { weightDist: wDist, weightCrowd: wCrowd }),

  branchBound: (from, to, wDist, wCrowd) =>
    API.post('/routes/branch-bound', { from, to, weightDist: wDist, weightCrowd: wCrowd }),

  getStations: () =>
    API.get('/routes/stations'),
};

export default API;