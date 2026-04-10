export const METRO_LINES = [
  { id: 'red', name: 'Red Line', color: '#ef4444' },
  { id: 'blue', name: 'Blue Line', color: '#3b82f6' },
  { id: 'green', name: 'Green Line', color: '#22c55e' },
  { id: 'yellow', name: 'Yellow Line', color: '#fbbf24' },
];

export const STATIONS = [
  { id: 'Central', name: 'Central', crowdLevel: 8, lineId: 'red', x: 400, y: 300 },
  { id: 'Park', name: 'Park', crowdLevel: 4, lineId: 'red', x: 400, y: 200 },
  { id: 'University', name: 'University', crowdLevel: 6, lineId: 'red', x: 400, y: 120 },
  { id: 'Stadium', name: 'Stadium', crowdLevel: 5, lineId: 'red', x: 400, y: 40 },
  { id: 'Airport', name: 'Airport', crowdLevel: 9, lineId: 'red', x: 400, y: -40 },
  { id: 'Market', name: 'Market', crowdLevel: 7, lineId: 'blue', x: 550, y: 300 },
  { id: 'Tech_Hub', name: 'Tech Hub', crowdLevel: 3, lineId: 'blue', x: 700, y: 220 },
  { id: 'Harbor', name: 'Harbor', crowdLevel: 5, lineId: 'blue', x: 700, y: 320 },
  { id: 'Beach', name: 'Beach', crowdLevel: 2, lineId: 'blue', x: 700, y: 420 },
  { id: 'Museum', name: 'Museum', crowdLevel: 4, lineId: 'green', x: 300, y: 120 },
  { id: 'City_Hall', name: 'City Hall', crowdLevel: 6, lineId: 'green', x: 300, y: 220 },
  { id: 'Riverside', name: 'Riverside', crowdLevel: 3, lineId: 'green', x: 300, y: 320 },
  { id: 'Industrial', name: 'Industrial', crowdLevel: 4, lineId: 'yellow', x: 500, y: -40 },
  { id: 'Warehouse', name: 'Warehouse', crowdLevel: 2, lineId: 'yellow', x: 600, y: -80 },
  { id: 'Junction', name: 'Junction', crowdLevel: 3, lineId: 'yellow', x: 650, y: 20 },
];

export const EDGES = [
  { from: 'Central', to: 'Park', distance: 4 },
  { from: 'Central', to: 'Market', distance: 3 },
  { from: 'Central', to: 'University', distance: 8 },
  { from: 'Park', to: 'University', distance: 5 },
  { from: 'Park', to: 'Stadium', distance: 6 },
  { from: 'University', to: 'Museum', distance: 4 },
  { from: 'University', to: 'Stadium', distance: 3 },
  { from: 'Stadium', to: 'Airport', distance: 7 },
  { from: 'Airport', to: 'Industrial', distance: 5 },
  { from: 'Market', to: 'Harbor', distance: 6 },
  { from: 'Market', to: 'City_Hall', distance: 5 },
  { from: 'Tech_Hub', to: 'Harbor', distance: 4 },
  { from: 'Harbor', to: 'Beach', distance: 5 },
  { from: 'Harbor', to: 'Industrial', distance: 6 },
  { from: 'Museum', to: 'City_Hall', distance: 3 },
  { from: 'City_Hall', to: 'Riverside', distance: 4 },
  { from: 'Riverside', to: 'Market', distance: 4 },
  { from: 'Industrial', to: 'Warehouse', distance: 3 },
  { from: 'Warehouse', to: 'Junction', distance: 4 },
  { from: 'Junction', to: 'Harbor', distance: 7 },
];

export const buildRawGraph = () => {
  const graph = {};
  
  STATIONS.forEach(station => {
    graph[station.id] = {};
  });

  EDGES.forEach(edge => {
    graph[edge.from][edge.to] = edge.distance;
    graph[edge.to][edge.from] = edge.distance;
  });

  return graph;
};

export const buildGraph = (wDist = 0.7, wCrowd = 0.3) => {
  const graph = {};
  
  STATIONS.forEach(station => {
    graph[station.id] = {};
  });

  EDGES.forEach(edge => {
    const fromStation = STATIONS.find(s => s.id === edge.from);
    const toStation = STATIONS.find(s => s.id === edge.to);
    const crowdAvg = (fromStation.crowdLevel + toStation.crowdLevel) / 2;
    const weight = wDist * edge.distance + wCrowd * crowdAvg;
    
    graph[edge.from][edge.to] = weight;
    graph[edge.to][edge.from] = weight;
  });

  return graph;
};

export const getWeightedEdgeWeight = (edge, wDist = 0.7, wCrowd = 0.3) => {
  const fromStation = STATIONS.find(s => s.id === edge.from);
  const toStation = STATIONS.find(s => s.id === edge.to);
  const crowdAvg = (fromStation.crowdLevel + toStation.crowdLevel) / 2;
  return wDist * edge.distance + wCrowd * crowdAvg;
};

export const getLineColor = (lineId) => {
  const line = METRO_LINES.find(l => l.id === lineId);
  return line ? line.color : '#888';
};