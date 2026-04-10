export function RouteResults({ results }) {
  const { dijkstra, floydWarshall, branchBound } = results;
  
  if (!dijkstra && !floydWarshall && !branchBound) {
    return (
      <div className="results-empty">
        <p>Select stations and click "Find Routes" to see results</p>
      </div>
    );
  }

  const renderResultCard = (result, title) => {
    if (!result) return null;
    
    return (
      <div className="result-card">
        <h3 className="result-title">{title}</h3>
        <div className="result-stats">
          <div className="stat">
            <span className="stat-label">Distance</span>
            <span className="stat-value">{result.distance?.toFixed(1) || 'N/A'}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Hops</span>
            <span className="stat-value">{result.hops ?? 'N/A'}</span>
          </div>
          {result.nodesExplored && (
            <div className="stat">
              <span className="stat-label">Explored</span>
              <span className="stat-value">{result.nodesExplored}</span>
            </div>
          )}
          {result.computeTimeMs && (
            <div className="stat">
              <span className="stat-label">Time</span>
              <span className="stat-value">{result.computeTimeMs.toFixed(1)}ms</span>
            </div>
          )}
        </div>
        {result.path && result.path.length > 0 && (
          <div className="result-path">
            <span className="path-label">Path:</span>
            <span className="path-stations">
              {result.path.join(' → ')}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="results-container">
      <h2 className="results-heading">Algorithm Results</h2>
      {renderResultCard(dijkstra, "Dijkstra's Algorithm")}
      {renderResultCard(floydWarshall, 'Floyd-Warshall')}
      {renderResultCard(branchBound, 'Branch & Bound')}
    </div>
  );
}