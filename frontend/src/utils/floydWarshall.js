export function floydWarshall(graph) {
  const nodes = Object.keys(graph);
  const n = nodes.length;
  const idx = {};
  
  nodes.forEach((node, i) => {
    idx[node] = i;
  });

  const dist = Array(n).fill(null).map(() => Array(n).fill(Infinity));
  const next = Array(n).fill(null).map(() => Array(n).fill(-1));

  for (let i = 0; i < n; i++) {
    dist[i][i] = 0;
  }

  for (const [u, neighbors] of Object.entries(graph)) {
    for (const [v, w] of Object.entries(neighbors)) {
      const ui = idx[u];
      const vi = idx[v];
      dist[ui][vi] = w;
      next[ui][vi] = vi;
    }
  }

  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] !== Infinity && dist[k][j] !== Infinity) {
          if (dist[i][k] + dist[k][j] < dist[i][j]) {
            dist[i][j] = dist[i][k] + dist[k][j];
            next[i][j] = next[i][k];
          }
        }
      }
    }
  }

  const getPath = (src, dst) => {
    const s = idx[src];
    const t = idx[dst];
    
    if (next[s][t] === -1) return [];
    
    const path = [nodes[s]];
    let curr = s;
    
    while (curr !== t) {
      curr = next[curr][t];
      path.push(nodes[curr]);
    }
    
    return path;
  };

  return {
    nodes,
    distMatrix: dist,
    next,
    idx,
    getPath,
    getDistance: (src, dst) => {
      const s = idx[src];
      const d = idx[dst];
      return dist[s][d] === Infinity ? null : dist[s][d];
    }
  };
}