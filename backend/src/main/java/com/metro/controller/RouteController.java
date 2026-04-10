package com.metro.controller;

import com.metro.dto.RouteRequest;
import com.metro.model.Station;
import com.metro.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/routes")
@CrossOrigin(origins = "http://localhost:5173")
public class RouteController {

    @Autowired
    private GraphService graphService;
    
    @Autowired
    private DijkstraService dijkstraService;
    
    @Autowired
    private FloydWarshallService floydService;
    
    @Autowired
    private BranchBoundService bbService;

    @PostMapping("/dijkstra")
    public ResponseEntity<Map<String, Object>> dijkstra(@RequestBody RouteRequest req) {
        var graph = graphService.buildWeightedGraph(req.getWeightDist(), req.getWeightCrowd());
        return ResponseEntity.ok(dijkstraService.findShortestPath(graph, req.getFrom(), req.getTo()));
    }

    @PostMapping("/floyd-warshall")
    public ResponseEntity<Map<String, Object>> floydWarshall(@RequestBody RouteRequest req) {
        var graph = graphService.buildWeightedGraph(req.getWeightDist(), req.getWeightCrowd());
        var result = floydService.compute(graph);
        
        if (req.getFrom() != null && req.getTo() != null) {
            List<String> path = floydService.getPath(result, req.getFrom(), req.getTo());
            result.put("path", path);
            result.put("distance", result.get("distMatrix"));
        }
        
        return ResponseEntity.ok(result);
    }

    @PostMapping("/branch-bound")
    public ResponseEntity<Map<String, Object>> branchBound(@RequestBody RouteRequest req) {
        var graph = graphService.buildWeightedGraph(req.getWeightDist(), req.getWeightCrowd());
        return ResponseEntity.ok(bbService.findOptimalPath(graph, req.getFrom(), req.getTo()));
    }

    @GetMapping("/stations")
    public ResponseEntity<List<Station>> getStations() {
        return ResponseEntity.ok(graphService.getAllStations());
    }
}