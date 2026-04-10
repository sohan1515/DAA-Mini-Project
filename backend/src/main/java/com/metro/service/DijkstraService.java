package com.metro.service;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class DijkstraService {

    public Map<String, Object> findShortestPath(Map<String, Map<String, Double>> graph,
                                                 String source, String destination) {
        Map<String, Double> dist = new HashMap<>();
        Map<String, String> prev = new HashMap<>();
        PriorityQueue<double[]> pq = new PriorityQueue<>(Comparator.comparingDouble(a -> a[0]));
        Set<String> visited = new HashSet<>();

        for (String node : graph.keySet()) {
            dist.put(node, Double.MAX_VALUE);
        }
        dist.put(source, 0.0);
        
        Map<Integer, String> hashToNode = new HashMap<>();
        hashToNode.put(source.hashCode(), source);
        pq.offer(new double[]{0, source.hashCode()});

        long startTime = System.nanoTime();
        int nodesExplored = 0;

        while (!pq.isEmpty()) {
            double[] curr = pq.poll();
            String u = hashToNode.get((int) curr[1]);
            if (u == null || visited.contains(u)) continue;
            visited.add(u);
            nodesExplored++;
            
            if (u.equals(destination)) break;

            for (Map.Entry<String, Double> neighbor : graph.getOrDefault(u, Map.of()).entrySet()) {
                String v = neighbor.getKey();
                double weight = neighbor.getValue();
                double newDist = dist.get(u) + weight;

                if (newDist < dist.getOrDefault(v, Double.MAX_VALUE)) {
                    dist.put(v, newDist);
                    prev.put(v, u);
                    hashToNode.put(v.hashCode(), v);
                    pq.offer(new double[]{newDist, v.hashCode()});
                }
            }
        }

        long endTime = System.nanoTime();

        List<String> path = new ArrayList<>();
        String cur = destination;
        while (cur != null) {
            path.add(0, cur);
            cur = prev.get(cur);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("algorithm", "DIJKSTRA");
        result.put("distance", dist.get(destination));
        result.put("path", path);
        result.put("hops", path.size() - 1);
        result.put("nodesExplored", nodesExplored);
        result.put("computeTimeMs", (endTime - startTime) / 1_000_000.0);

        return result;
    }
}