import { STATIONS, EDGES, getLineColor, getWeightedEdgeWeight } from '../constants/metroData';

export function MetroMap({ highlightedPath = [], weightDist = 0.7, weightCrowd = 0.3, onStationClick }) {
  const pathSet = new Set(highlightedPath);
  
  const isEdgeHighlighted = (from, to) => {
    for (let i = 0; i < highlightedPath.length - 1; i++) {
      const curr = highlightedPath[i];
      const next = highlightedPath[i + 1];
      if ((curr === from && next === to) || (curr === to && next === from)) {
        return true;
      }
    }
    return false;
  };

  return (
    <svg 
      viewBox="-100 -150 900 650" 
      className="metro-map"
      style={{ width: '100%', height: '100%', background: '#1a1a2e' }}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {EDGES.map((edge, idx) => {
        const fromStation = STATIONS.find(s => s.id === edge.from);
        const toStation = STATIONS.find(s => s.id === edge.to);
        const isHighlighted = isEdgeHighlighted(edge.from, edge.to);
        const midX = (fromStation.x + toStation.x) / 2;
        const midY = (fromStation.y + toStation.y) / 2;
        const dx = toStation.x - fromStation.x;
        const dy = toStation.y - fromStation.y;
        const length = Math.hypot(dx, dy) || 1;
        const offset = 14;
        const labelX = midX - (dy / length) * offset;
        const labelY = midY + (dx / length) * offset;
        const weightedCost = getWeightedEdgeWeight(edge, weightDist, weightCrowd);
        
        return (
          <g key={idx}>
            <line
              x1={fromStation.x}
              y1={fromStation.y}
              x2={toStation.x}
              y2={toStation.y}
              stroke={isHighlighted ? '#fff' : '#444'}
              strokeWidth={isHighlighted ? 4 : 2}
              strokeLinecap="round"
              opacity={isHighlighted ? 1 : 0.6}
            />
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={isHighlighted ? '#fff' : '#888'}
              fontSize={isHighlighted ? "11" : "9"}
              fontWeight={isHighlighted ? "700" : "400"}
              pointerEvents="none"
            >
              <tspan x={labelX} dy="0">{edge.distance} km</tspan>
              {isHighlighted && (
                <tspan x={labelX} dy="1.2em" fontSize="8" fill="#aaa">
                  {weightedCost.toFixed(1)} weighted
                </tspan>
              )}
            </text>
          </g>
        );
      })}
      
      {STATIONS.map(station => {
        const isOnPath = pathSet.has(station.id);
        const lineColor = getLineColor(station.lineId);
        
        return (
          <g 
            key={station.id} 
            onClick={() => onStationClick?.(station)}
            style={{ cursor: onStationClick ? 'pointer' : 'default' }}
          >
            {isOnPath && (
              <circle
                cx={station.x}
                cy={station.y}
                r="18"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                opacity="0.5"
              />
            )}
            <circle
              cx={station.x}
              cy={station.y}
              r={isOnPath ? 14 : 10}
              fill={isOnPath ? lineColor : '#2a2a4a'}
              stroke={isOnPath ? '#fff' : lineColor}
              strokeWidth={isOnPath ? 3 : 2}
              filter={isOnPath ? 'url(#glow)' : ''}
            />
            <text
              x={station.x}
              y={station.y + 28}
              textAnchor="middle"
              fill={isOnPath ? '#fff' : '#aaa'}
              fontSize="11"
              fontWeight={isOnPath ? 'bold' : 'normal'}
            >
              {station.name}
            </text>
            {isOnPath && (
              <text
                x={station.x}
                y={station.y + 42}
                textAnchor="middle"
                fill="#aaa"
                fontSize="9"
              >
                {station.crowdLevel}/10
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}