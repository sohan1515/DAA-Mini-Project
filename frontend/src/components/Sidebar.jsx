import { STATIONS, METRO_LINES } from '../constants/metroData';

export function Sidebar({ 
  fromStation, 
  toStation, 
  onFromChange, 
  onToChange,
  weightDist,
  weightCrowd,
  onWeightDistChange,
  onWeightCrowdChange,
  onRun,
  loading 
}) {
  return (
    <div className="sidebar">
      <h1 className="sidebar-title">Metro Route Planner</h1>
      <p className="sidebar-subtitle">Find the shortest & least crowded routes</p>
      
      <div className="form-group">
        <label>From Station</label>
        <select 
          value={fromStation} 
          onChange={(e) => onFromChange(e.target.value)}
          className="select-input"
        >
          <option value="">Select source</option>
          {STATIONS.map(station => (
            <option key={station.id} value={station.id}>
              {station.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>To Station</label>
        <select 
          value={toStation} 
          onChange={(e) => onToChange(e.target.value)}
          className="select-input"
        >
          <option value="">Select destination</option>
          {STATIONS.map(station => (
            <option key={station.id} value={station.id}>
              {station.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Distance Weight: {weightDist.toFixed(1)}</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={weightDist}
          onChange={(e) => onWeightDistChange(parseFloat(e.target.value))}
          className="slider"
        />
      </div>

      <div className="form-group">
        <label>Crowd Weight: {weightCrowd.toFixed(1)}</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={weightCrowd}
          onChange={(e) => onWeightCrowdChange(parseFloat(e.target.value))}
          className="slider"
        />
      </div>

      <button 
        className="run-button"
        onClick={onRun}
        disabled={!fromStation || !toStation || loading}
      >
        {loading ? 'Computing...' : 'Find Routes'}
      </button>

      <div className="legend">
        <h3>Metro Lines</h3>
        {METRO_LINES.map(line => (
          <div key={line.id} className="legend-item">
            <span 
              className="legend-color" 
              style={{ backgroundColor: line.color }}
            />
            <span>{line.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}