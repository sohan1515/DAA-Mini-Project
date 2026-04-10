export function AllPairsMatrix({ allPairs }) {
  if (!allPairs || !allPairs.nodes) {
    return (
      <div className="matrix-empty">
        <p>Run Floyd-Warshall to see the distance matrix</p>
      </div>
    );
  }

  const { nodes, distMatrix } = allPairs;

  const formatDistance = (val) => {
    if (val === Infinity || val === undefined) return '∞';
    return val.toFixed(1);
  };

  return (
    <div className="matrix-container">
      <h3 className="matrix-title">Floyd-Warshall Distance Matrix</h3>
      <div className="matrix-scroll">
        <table className="matrix-table">
          <thead>
            <tr>
              <th></th>
              {nodes.map(node => (
                <th key={node}>{node.substring(0, 8)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {nodes.map((rowNode, i) => (
              <tr key={rowNode}>
                <td className="row-header">{rowNode}</td>
                {nodes.map((colNode, j) => (
                  <td 
                    key={colNode}
                    className={distMatrix[i][j] === 0 ? 'cell-self' : ''}
                  >
                    {formatDistance(distMatrix[i][j])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}