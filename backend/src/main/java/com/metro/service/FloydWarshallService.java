package com.metro.service;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class FloydWarshallService {

    public Map<String, Object> compute(Map<String, Map<String, Double>> graph) {
        List<String> nodes = new ArrayList<>(graph.keySet());
        int n = nodes.size();
        Map<String, Integer> idx = new HashMap<>();
        for (int i = 0; i < n; i++) {
            idx.put(nodes.get(i), i);
        }

        double[][] dist = new double[n][n];
        int[][] next = new int[n][n];

        for (double[] row : dist) {
            Arrays.fill(row, Double.MAX_VALUE / 2);
        }
        for (int i = 0; i < n; i++) {
            dist[i][i] = 0;
            Arrays.fill(next[i], -1);
        }

        for (Map.Entry<String, Map<String, Double>> entry : graph.entrySet()) {
            int u = idx.get(entry.getKey());
            for (Map.Entry<String, Double> neighbor : entry.getValue().entrySet()) {
                int v = idx.get(neighbor.getKey());
                dist[u][v] = neighbor.getValue();
                next[u][v] = v;
            }
        }

        long startTime = System.nanoTime();
        
        for (int k = 0; k < n; k++) {
            for (int i = 0; i < n; i++) {
                for (int j = 0; j < n; j++) {
                    if (dist[i][k] + dist[k][j] < dist[i][j]) {
                        dist[i][j] = dist[i][k] + dist[k][j];
                        next[i][j] = next[i][k];
                    }
                }
            }
        }

        long endTime = System.nanoTime();

        Map<String, Object> result = new HashMap<>();
        result.put("nodes", nodes);
        result.put("distMatrix", dist);
        result.put("next", next);
        result.put("idx", idx);
        result.put("computeTimeMs", (endTime - startTime) / 1_000_000.0);

        return result;
    }

    public List<String> getPath(Map<String, Object> resultMap, String src, String dst) {
        @SuppressWarnings("unchecked")
        Map<String, Integer> idx = (Map<String, Integer>) resultMap.get("idx");
        @SuppressWarnings("unchecked")
        int[][] next = (int[][]) resultMap.get("next");
        
        int s = idx.get(src);
        int t = idx.get(dst);
        
        if (next[s][t] == -1) return Collections.emptyList();
        
        List<String> path = new ArrayList<>();
        @SuppressWarnings("unchecked")
        List<String> nodes = (List<String>) resultMap.get("nodes");
        path.add(nodes.get(s));
        
        while (s != t) {
            s = next[s][t];
            path.add(nodes.get(s));
        }
        
        return path;
    }
}