package com.metro.service;

import com.metro.model.Edge;
import com.metro.model.Station;
import com.metro.repository.EdgeRepository;
import com.metro.repository.StationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class GraphService {

    @Autowired
    private StationRepository stationRepository;
    
    @Autowired
    private EdgeRepository edgeRepository;

    public Map<String, Map<String, Double>> buildWeightedGraph(double wDist, double wCrowd) {
        List<Station> stations = stationRepository.findAll();
        List<Edge> edges = edgeRepository.findByIsActiveTrue();
        
        Map<String, Station> stationMap = new HashMap<>();
        stations.forEach(s -> stationMap.put(s.getId(), s));
        
        Map<String, Map<String, Double>> graph = new HashMap<>();
        stations.forEach(s -> graph.put(s.getId(), new HashMap<>()));
        
        for (Edge edge : edges) {
            Station fromStation = stationMap.get(edge.getFromId());
            Station toStation = stationMap.get(edge.getToId());
            
            if (fromStation == null || toStation == null) continue;
            
            double crowdAvg = (fromStation.getCrowdLevel() + toStation.getCrowdLevel()) / 2.0;
            double weight = wDist * edge.getDistance().doubleValue() + wCrowd * crowdAvg;
            
            graph.get(edge.getFromId()).put(edge.getToId(), weight);
            graph.get(edge.getToId()).put(edge.getFromId(), weight);
        }
        
        return graph;
    }

    public List<Station> getAllStations() {
        return stationRepository.findAll();
    }
}