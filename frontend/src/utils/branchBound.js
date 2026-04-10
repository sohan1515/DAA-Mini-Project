export function branchBound(graph, src, dst) {
  let bestCost = Infinity;
  let bestPath = [];
  const explorationLog = [];

  function dfs(current, path, cost, visited) {
    if (cost >= bestCost) {
      explorationLog.push({ path: [...path], cost, status: 'PRUNED' });
      return;
    }

    if (current === dst) {
      bestCost = cost;
      bestPath = [...path];
      explorationLog.push({ path: [...path], cost, status: 'OPTIMAL' });
      return;
    }

    const neighbors = graph[current] || {};
    
    for (const [next, weight] of Object.entries(neighbors)) {
      if (!visited.has(next)) {
        const nextCost = cost + weight;
        if (next !== dst) {
          explorationLog.push({ path: [...path, next], cost: nextCost, status: 'EXPLORING' });
        }

        visited.add(next);
        dfs(next, [...path, next], nextCost, visited);
        visited.delete(next);
      }
    }
  }

  const visited = new Set([src]);
  dfs(src, [src], 0, visited);

  return {
    distance: bestCost === Infinity ? null : bestCost,
    path: bestCost === Infinity ? [] : bestPath,
    hops: bestPath.length - 1,
    prunedBranches: explorationLog.filter(log => log.status === 'PRUNED').length,
    explorationLog: explorationLog.slice(0, 20),
    algorithm: 'BRANCH_AND_BOUND'
  };
}