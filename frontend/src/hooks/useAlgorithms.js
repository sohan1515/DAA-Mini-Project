import { useState, useCallback } from 'react';
import { dijkstra } from '../utils/dijkstra';
import { floydWarshall } from '../utils/floydWarshall';
import { branchBound } from '../utils/branchBound';
import { buildGraph, buildRawGraph, STATIONS } from '../constants/metroData';

export function useAlgorithms() {
  const [results, setResults] = useState({
    dijkstra: null,
    floydWarshall: null,
    branchBound: null,
    allPairs: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runDijkstra = useCallback((from, to, wDist = 0.7, wCrowd = 0.3) => {
    const graph = buildGraph(wDist, wCrowd);
    const result = dijkstra(graph, from, to);
    setResults(prev => ({ ...prev, dijkstra: result }));
    return result;
  }, []);

  const runFloydWarshall = useCallback((wDist = 0.7, wCrowd = 0.3) => {
    const rawGraph = buildRawGraph();
    const startTime = performance.now();
    const result = floydWarshall(rawGraph);
    const computeTimeMs = performance.now() - startTime;
    
    setResults(prev => ({ 
      ...prev, 
      floydWarshall: { ...result, computeTimeMs },
      allPairs: result 
    }));
    return result;
  }, []);

  const runBranchBound = useCallback((from, to, wDist = 0.7, wCrowd = 0.3) => {
    const graph = buildGraph(wDist, wCrowd);
    const result = branchBound(graph, from, to);
    setResults(prev => ({ ...prev, branchBound: result }));
    return result;
  }, []);

  const runAllAlgorithms = useCallback(async (from, to, wDist = 0.7, wCrowd = 0.3) => {
    setLoading(true);
    setError(null);

    try {
      const weightedGraph = buildGraph(wDist, wCrowd);
      const rawGraph = buildRawGraph();
      
      const dijkstraResult = dijkstra(weightedGraph, from, to);
      const branchBoundResult = branchBound(weightedGraph, from, to);
      
      const startTime = performance.now();
      const floydResult = floydWarshall(rawGraph);
      const computeTimeMs = performance.now() - startTime;

      const floydPathResult = {
        distance: floydResult.getDistance(from, to),
        path: floydResult.getPath(from, to),
        hops: floydResult.getPath(from, to).length - 1,
        computeTimeMs,
        algorithm: 'FLOYD_WARSHALL'
      };

      setResults({
        dijkstra: dijkstraResult,
        floydWarshall: floydPathResult,
        branchBound: branchBoundResult,
        allPairs: floydResult,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    results,
    loading,
    error,
    runDijkstra,
    runFloydWarshall,
    runBranchBound,
    runAllAlgorithms,
    stations: STATIONS,
  };
}