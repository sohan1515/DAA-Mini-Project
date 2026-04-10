package com.metro.service;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class BranchBoundService {

    private double bestCost;
    private List<String> bestPath;
    private List<Map<String, Object>> explorationLog;

    public Map<String, Object> findOptimalPath(Map<String, Map<String, Double>> graph,
                                                String src, String dst) {
        bestCost = Double.MAX_VALUE;
        bestPath = new ArrayList<>();
        explorationLog = new ArrayList<>();

        Set<String> visited = new HashSet<>();
        visited.add(src);
        dfs(graph, List.of(src), 0.0, src, dst, visited);

        Map<String, Object> result = new HashMap<>();
        result.put("algorithm", "BRANCH_AND_BOUND");
        result.put("distance", bestCost == Double.MAX_VALUE ? null : bestCost);
        result.put("path", bestCost == Double.MAX_VALUE ? new ArrayList<>() : bestPath);
        result.put("hops", bestPath.size() - 1);
        result.put("prunedBranches", (int) explorationLog.stream().filter(log -> "PRUNED".equals(log.get("status"))).count());
        result.put("explorationLog", explorationLog.stream().limit(20).toList());

        return result;
    }

    private void dfs(Map<String, Map<String, Double>> graph,
                     List<String> path, double cost,
                     String current, String destination,
                     Set<String> visited) {

        if (cost >= bestCost) {
            Map<String, Object> log = new HashMap<>();
            log.put("path", new ArrayList<>(path));
            log.put("cost", cost);
            log.put("status", "PRUNED");
            explorationLog.add(log);
            return;
        }

        if (current.equals(destination)) {
            bestCost = cost;
            bestPath = new ArrayList<>(path);
            Map<String, Object> log = new HashMap<>();
            log.put("path", new ArrayList<>(path));
            log.put("cost", cost);
            log.put("status", "OPTIMAL");
            explorationLog.add(log);
            return;
        }

        for (Map.Entry<String, Double> neighbor : graph.getOrDefault(current, Map.of()).entrySet()) {
            String next = neighbor.getKey();
            if (!visited.contains(next)) {
                List<String> newPath = new ArrayList<>(path);
                newPath.add(next);
                
                Map<String, Object> log = new HashMap<>();
                log.put("path", new ArrayList<>(newPath));
                log.put("cost", cost + neighbor.getValue());
                log.put("status", "EXPLORING");
                explorationLog.add(log);
                
                visited.add(next);
                dfs(graph, newPath, cost + neighbor.getValue(), next, destination, visited);
                visited.remove(next);
            }
        }
    }
}