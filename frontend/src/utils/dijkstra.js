export function dijkstra(graph, src, dst) {
  const dist = {};
  const prev = {};
  const visited = new Set();
  
  for (const node of Object.keys(graph)) {
    dist[node] = Infinity;
  }
  dist[src] = 0;
  
  const pq = [[0, src]];
  const nodesExplored = new Set();

  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift();
    
    if (visited.has(u)) continue;
    visited.add(u);
    nodesExplored.add(u);
    
    if (u === dst) break;

    for (const [v, w] of Object.entries(graph[u] || {})) {
      const nd = d + w;
      if (nd < dist[v]) {
        dist[v] = nd;
        prev[v] = u;
        pq.push([nd, v]);
      }
    }
  }

  const path = [];
  let cur = dst;
  while (cur) {
    path.unshift(cur);
    cur = prev[cur];
  }

  return {
    distance: dist[dst] === Infinity ? null : dist[dst],
    path: dist[dst] === Infinity ? [] : path,
    hops: path.length - 1,
    nodesExplored: nodesExplored.size,
    algorithm: 'DIJKSTRA'
  };
}