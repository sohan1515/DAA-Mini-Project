export function BranchBoundTree({ result }) {
  if (!result || !result.explorationLog || result.explorationLog.length === 0) {
    return (
      <div className="tree-empty">
        <p>Run Branch & Bound to see the exploration log</p>
      </div>
    );
  }

  const { explorationLog, prunedBranches, path, distance } = result;
  const selectedPathKey = path?.join(' → ');

  return (
    <div className="tree-container">
      <h3 className="tree-title">Branch & Bound Exploration</h3>
      <div className="tree-stats">
        <span className="tree-stat">Pruned Branches: {prunedBranches}</span>
        {path && path.length > 0 && (
          <span className="tree-stat tree-selected-path">
            Selected Path: <strong>{path.join(' → ')}</strong> ({distance?.toFixed(1)} cost)
          </span>
        )}
      </div>
      <div className="tree-log">
        {explorationLog.map((log, idx) => {
          const isSelected = log.path.join(' → ') === selectedPathKey;
          return (
            <div 
              key={idx} 
              className={`tree-node ${log.status.toLowerCase()}${isSelected ? ' selected' : ''}`}
            >
              <span className="node-path">
                {log.path.join(' → ')}
              </span>
              <span className="node-cost">
                Cost: {log.cost?.toFixed(1)}
              </span>
              <span className={`node-status ${log.status.toLowerCase()}`}>
                {log.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}