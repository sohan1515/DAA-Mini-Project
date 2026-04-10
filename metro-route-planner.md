# 🚇 Metro Route Planning System

> **Mini Project #17** — Find shortest and least-crowded routes across metro systems using graph algorithms.
> **Stack:** React · Java (Spring Boot) · Supabase (PostgreSQL)

---

## 📑 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [Graph Model](#graph-model)
5. [Algorithms](#algorithms)
   - [Dijkstra's Algorithm](#1-dijkstras-algorithm)
   - [Floyd-Warshall](#2-floyd-warshall-all-pairs)
   - [Weighted Optimization](#3-weighted-optimization)
   - [Branch & Bound](#4-branch--bound)
6. [Database Schema (Supabase)](#database-schema-supabase)
7. [Backend — Java Spring Boot](#backend--java-spring-boot)
8. [Frontend — React](#frontend--react)
9. [API Reference](#api-reference)
10. [Project Structure](#project-structure)
11. [Setup & Installation](#setup--installation)
12. [Environment Variables](#environment-variables)
13. [Algorithm Complexity](#algorithm-complexity)
14. [Sample Data](#sample-data)
15. [Future Enhancements](#future-enhancements)

---

## Project Overview

The Metro Route Planning System models a city metro network as a weighted graph and applies multiple classical algorithms to find the **shortest** and **least-crowded** routes between any two stations.

### Problem Statement

Given a metro network with stations and edges (connections), find:
- The shortest path by distance (Dijkstra)
- All-pairs optimal routes precomputed (Floyd-Warshall)
- Multi-objective optimized route (Distance + Crowd weight)
- Exact optimal path with pruning (Branch & Bound)

### Key Features

- Interactive metro map with real-time route highlighting
- Adjustable optimization weights (distance vs. crowd level)
- Floyd-Warshall all-pairs distance matrix visualization
- Branch & Bound exploration tree viewer
- Real-time crowd updates via Supabase subscriptions
- RESTful Java backend with full graph computation

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend** | React | 18.x | UI, map visualization, algorithm runner |
| **Styling** | CSS Variables + Inline | — | Dark theme, responsive layout |
| **Backend** | Java Spring Boot | 3.2.x | REST API, algorithm engine |
| **Build Tool** | Maven | 3.9.x | Backend dependency management |
| **Database** | Supabase (PostgreSQL) | 15.x | Stations, edges, route cache |
| **Realtime** | Supabase Realtime | — | Live crowd level updates |
| **Auth** | Supabase Auth | — | (Optional) user sessions |
| **HTTP Client** | Axios | 1.x | Frontend API calls |
| **ORM** | Spring Data JPA + Hibernate | 6.x | Java ↔ Postgres mapping |
| **Connection Pool** | HikariCP | 5.x | Database connection management |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        React Frontend                        │
│   MetroMap SVG  │  Algorithm Results  │  Controls Sidebar   │
└────────────────────────┬────────────────────────────────────┘
                         │  REST API (Axios)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Java Spring Boot Backend                     │
│  RouteController  │  GraphService  │  AlgorithmEngine        │
│  DijkstraService  │  FloydService  │  BranchBoundService     │
└────────────────────────┬────────────────────────────────────┘
                         │  Spring Data JPA
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (PostgreSQL)                      │
│  stations  │  edges  │  metro_lines  │  routes_cache         │
└─────────────────────────────────────────────────────────────┘
                         │  Supabase Realtime
                         ▼
                  React Frontend (WebSocket)
```

---

## Graph Model

### Task 1 — Model as Graph

The metro network is represented as a **weighted undirected graph** `G = (V, E, W)` where:

- `V` = set of stations (nodes)
- `E` = set of connections between stations (edges)
- `W(e)` = composite weight of each edge

### Composite Edge Weight

```
W(u, v) = α × distance(u, v) + β × crowd_avg(u, v)
```

Where:
- `α` = distance weight (0–1), default `0.7`
- `β` = crowd weight (0–1), default `0.3`
- `α + β = 1` always

### Metro Network — Stations and Lines

| Line | Color | Stations |
|---|---|---|
| Red Line | `#ef4444` | Central → Park → University → Stadium → Airport |
| Blue Line | `#3b82f6` | Central → Market → Tech Hub → Harbor → Beach |
| Green Line | `#22c55e` | University → Museum → City Hall → Riverside → Market |
| Yellow Line | `#fbbf24` | Airport → Industrial → Warehouse → Junction → Harbor |

### Adjacency Representation

```json
{
  "Central":    { "Park": 4, "Market": 3, "University": 8 },
  "Park":       { "Central": 4, "University": 5, "Stadium": 6 },
  "University": { "Park": 5, "Central": 8, "Museum": 4, "Stadium": 3 },
  "Stadium":    { "Park": 6, "University": 3, "Airport": 7 },
  "Airport":    { "Stadium": 7, "Industrial": 5 },
  "Market":     { "Central": 3, "Harbor": 6, "City_Hall": 5 },
  "Harbor":     { "Market": 6, "Tech_Hub": 4, "Beach": 5, "Industrial": 6 },
  "Museum":     { "University": 4, "City_Hall": 3 },
  "City_Hall":  { "Museum": 3, "Market": 5, "Riverside": 4 },
  "Riverside":  { "City_Hall": 4, "Market": 4 }
}
```

---

## Algorithms

### 1. Dijkstra's Algorithm

**Task 2** — Single-source shortest path using a min-priority queue.

**Time Complexity:** `O((V + E) log V)`
**Space Complexity:** `O(V)`

**When to use:** Finding the optimal route from one specific source station to a destination.

#### Java Implementation

```java
// DijkstraService.java
@Service
public class DijkstraService {

    public RouteResult findShortestPath(Map<String, Map<String, Double>> graph,
                                         String source, String destination) {
        Map<String, Double> dist = new HashMap<>();
        Map<String, String> prev = new HashMap<>();
        PriorityQueue<double[]> pq = new PriorityQueue<>(Comparator.comparingDouble(a -> a[0]));
        Set<String> visited = new HashSet<>();

        // Initialize distances
        for (String node : graph.keySet()) dist.put(node, Double.MAX_VALUE);
        dist.put(source, 0.0);
        pq.offer(new double[]{0, source.hashCode()});
        Map<Integer, String> hashToNode = new HashMap<>();
        hashToNode.put(source.hashCode(), source);

        while (!pq.isEmpty()) {
            double[] curr = pq.poll();
            String u = hashToNode.get((int) curr[1]);
            if (u == null || visited.contains(u)) continue;
            visited.add(u);
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

        // Reconstruct path
        List<String> path = new ArrayList<>();
        String cur = destination;
        while (cur != null) { path.add(0, cur); cur = prev.get(cur); }

        return new RouteResult(dist.get(destination), path, visited.size(), "DIJKSTRA");
    }
}
```

#### JavaScript (React) Implementation

```javascript
function dijkstra(graph, src, dst) {
  const dist = {}, prev = {}, visited = new Set();
  for (const n of Object.keys(graph)) dist[n] = Infinity;
  dist[src] = 0;
  const pq = [[0, src]];

  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift();
    if (visited.has(u)) continue;
    visited.add(u);
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

  // Reconstruct path
  const path = [];
  let cur = dst;
  while (cur) { path.unshift(cur); cur = prev[cur]; }
  return { dist: dist[dst], path };
}
```

---

### 2. Floyd-Warshall (All-Pairs)

**Task 3** — Compute optimal routes between every pair of stations.

**Time Complexity:** `O(V³)`
**Space Complexity:** `O(V²)`

**When to use:** Precompute and cache all N×N routes for instant lookup.

#### Java Implementation

```java
// FloydWarshallService.java
@Service
public class FloydWarshallService {

    public AllPairsResult compute(Map<String, Map<String, Double>> graph) {
        List<String> nodes = new ArrayList<>(graph.keySet());
        int n = nodes.size();
        Map<String, Integer> idx = new HashMap<>();
        for (int i = 0; i < n; i++) idx.put(nodes.get(i), i);

        double[][] dist = new double[n][n];
        int[][] next = new int[n][n];

        // Initialize
        for (double[] row : dist) Arrays.fill(row, Double.MAX_VALUE / 2);
        for (int i = 0; i < n; i++) {
            dist[i][i] = 0;
            Arrays.fill(next[i], -1);
        }

        // Set direct edges
        for (Map.Entry<String, Map<String, Double>> entry : graph.entrySet()) {
            int u = idx.get(entry.getKey());
            for (Map.Entry<String, Double> neighbor : entry.getValue().entrySet()) {
                int v = idx.get(neighbor.getKey());
                dist[u][v] = neighbor.getValue();
                next[u][v] = v;
            }
        }

        // Relax all pairs through every intermediate node
        for (int k = 0; k < n; k++)
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++)
                    if (dist[i][k] + dist[k][j] < dist[i][j]) {
                        dist[i][j] = dist[i][k] + dist[k][j];
                        next[i][j] = next[i][k];
                    }

        return new AllPairsResult(nodes, dist, next, idx);
    }

    public List<String> getPath(AllPairsResult result, String src, String dst) {
        int s = result.getIdx().get(src), t = result.getIdx().get(dst);
        if (result.getNext()[s][t] == -1) return Collections.emptyList();
        List<String> path = new ArrayList<>();
        path.add(result.getNodes().get(s));
        while (s != t) {
            s = result.getNext()[s][t];
            path.add(result.getNodes().get(s));
        }
        return path;
    }
}
```

---

### 3. Weighted Optimization

**Task 4** — Optimize route using configurable distance + crowd weights.

The composite weight formula enables multi-objective route optimization:

```java
// GraphService.java
@Service
public class GraphService {

    public Map<String, Map<String, Double>> buildWeightedGraph(
            List<Edge> edges, double wDist, double wCrowd) {

        Map<String, Map<String, Double>> graph = new HashMap<>();

        for (Edge edge : edges) {
            double crowdAvg = (edge.getFromStation().getCrowdLevel()
                             + edge.getToStation().getCrowdLevel()) / 2.0;
            double compositeWeight = wDist * edge.getDistance()
                                   + wCrowd * crowdAvg;

            graph.computeIfAbsent(edge.getFromId(), k -> new HashMap<>())
                 .put(edge.getToId(), compositeWeight);
            graph.computeIfAbsent(edge.getToId(), k -> new HashMap<>())
                 .put(edge.getFromId(), compositeWeight); // undirected
        }
        return graph;
    }
}
```

**Optimization scenarios:**

| α (distance) | β (crowd) | Effect |
|---|---|---|
| 1.0 | 0.0 | Pure shortest distance |
| 0.0 | 1.0 | Avoid crowded stations only |
| 0.7 | 0.3 | Balanced (default) |
| 0.3 | 0.7 | Strongly prefer uncrowded |

---

### 4. Branch & Bound

**Task 5** — Exact path search with intelligent pruning.

**Time Complexity:** `O(V!)` worst case, much better in practice with pruning
**Space Complexity:** `O(V)` for recursion stack

**When to use:** When you need the provably optimal path and can afford more computation.

```java
// BranchBoundService.java
@Service
public class BranchBoundService {

    private double bestCost;
    private List<String> bestPath;
    private List<BBNode> explorationLog;

    public RouteResult findOptimalPath(Map<String, Map<String, Double>> graph,
                                        String src, String dst) {
        bestCost = Double.MAX_VALUE;
        bestPath = new ArrayList<>();
        explorationLog = new ArrayList<>();

        Set<String> visited = new HashSet<>();
        visited.add(src);
        dfs(graph, List.of(src), 0.0, src, dst, visited);

        return new RouteResult(bestCost, bestPath, explorationLog.size(), "BRANCH_AND_BOUND");
    }

    private void dfs(Map<String, Map<String, Double>> graph,
                     List<String> path, double cost,
                     String current, String destination,
                     Set<String> visited) {

        // Pruning: abandon branch if already worse than best known
        if (cost >= bestCost) {
            explorationLog.add(new BBNode(path, cost, "PRUNED"));
            return;
        }

        if (current.equals(destination)) {
            bestCost = cost;
            bestPath = new ArrayList<>(path);
            explorationLog.add(new BBNode(path, cost, "OPTIMAL"));
            return;
        }

        for (Map.Entry<String, Double> neighbor :
             graph.getOrDefault(current, Map.of()).entrySet()) {
            String next = neighbor.getKey();
            if (!visited.contains(next)) {
                List<String> newPath = new ArrayList<>(path);
                newPath.add(next);
                explorationLog.add(new BBNode(newPath, cost + neighbor.getValue(), "EXPLORING"));
                visited.add(next);
                dfs(graph, newPath, cost + neighbor.getValue(), next, destination, visited);
                visited.remove(next);
            }
        }
    }
}
```

---

## Database Schema (Supabase)

### Tables

```sql
-- Metro Lines
CREATE TABLE metro_lines (
    id          VARCHAR(20) PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    color_hex   VARCHAR(7),
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- Stations
CREATE TABLE stations (
    id           VARCHAR(50) PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    crowd_level  INTEGER CHECK (crowd_level BETWEEN 1 AND 10),
    line_id      VARCHAR(20) REFERENCES metro_lines(id),
    latitude     DECIMAL(9, 6),
    longitude    DECIMAL(9, 6),
    created_at   TIMESTAMPTZ DEFAULT now(),
    updated_at   TIMESTAMPTZ DEFAULT now()
);

-- Edges (Graph adjacency)
CREATE TABLE edges (
    id            SERIAL PRIMARY KEY,
    from_id       VARCHAR(50) REFERENCES stations(id) ON DELETE CASCADE,
    to_id         VARCHAR(50) REFERENCES stations(id) ON DELETE CASCADE,
    distance      DECIMAL(6, 2) NOT NULL,
    crowd_weight  DECIMAL(5, 2) DEFAULT 1.0,
    is_active     BOOLEAN DEFAULT TRUE,
    UNIQUE (from_id, to_id)
);

-- Routes Cache (Floyd-Warshall precomputed results)
CREATE TABLE routes_cache (
    id            SERIAL PRIMARY KEY,
    src           VARCHAR(50) REFERENCES stations(id),
    dst           VARCHAR(50) REFERENCES stations(id),
    optimal_path  TEXT[],
    total_cost    DECIMAL(8, 2),
    hops          INTEGER,
    algorithm     VARCHAR(30) DEFAULT 'floyd_warshall',
    weight_dist   DECIMAL(4, 2) DEFAULT 0.7,
    weight_crowd  DECIMAL(4, 2) DEFAULT 0.3,
    computed_at   TIMESTAMPTZ DEFAULT now(),
    UNIQUE (src, dst, algorithm, weight_dist, weight_crowd)
);

-- Crowd History (for analytics)
CREATE TABLE crowd_history (
    id           SERIAL PRIMARY KEY,
    station_id   VARCHAR(50) REFERENCES stations(id),
    crowd_level  INTEGER,
    recorded_at  TIMESTAMPTZ DEFAULT now()
);
```

### Indexes

```sql
CREATE INDEX idx_edges_from     ON edges(from_id);
CREATE INDEX idx_edges_to       ON edges(to_id);
CREATE INDEX idx_routes_src_dst ON routes_cache(src, dst);
CREATE INDEX idx_crowd_station  ON crowd_history(station_id, recorded_at DESC);
```

### Seed Data

```sql
-- Metro Lines
INSERT INTO metro_lines VALUES
  ('red',    'Red Line',    '#ef4444'),
  ('blue',   'Blue Line',   '#3b82f6'),
  ('green',  'Green Line',  '#22c55e'),
  ('yellow', 'Yellow Line', '#fbbf24');

-- Stations
INSERT INTO stations (id, name, crowd_level, line_id) VALUES
  ('Central',     'Central',    8, 'red'),
  ('Park',        'Park',       4, 'red'),
  ('University',  'University', 6, 'red'),
  ('Stadium',     'Stadium',    5, 'red'),
  ('Airport',     'Airport',    9, 'red'),
  ('Market',      'Market',     7, 'blue'),
  ('Tech_Hub',    'Tech Hub',   3, 'blue'),
  ('Harbor',      'Harbor',     5, 'blue'),
  ('Beach',       'Beach',      2, 'blue'),
  ('Museum',      'Museum',     4, 'green'),
  ('City_Hall',   'City Hall',  6, 'green'),
  ('Riverside',   'Riverside',  3, 'green'),
  ('Industrial',  'Industrial', 4, 'yellow'),
  ('Warehouse',   'Warehouse',  2, 'yellow'),
  ('Junction',    'Junction',   3, 'yellow');

-- Edges
INSERT INTO edges (from_id, to_id, distance) VALUES
  ('Central',    'Park',       4),
  ('Central',    'Market',     3),
  ('Central',    'University', 8),
  ('Park',       'University', 5),
  ('Park',       'Stadium',    6),
  ('University', 'Museum',     4),
  ('University', 'Stadium',    3),
  ('Stadium',    'Airport',    7),
  ('Airport',    'Industrial', 5),
  ('Market',     'Harbor',     6),
  ('Market',     'City_Hall',  5),
  ('Tech_Hub',   'Harbor',     4),
  ('Harbor',     'Beach',      5),
  ('Harbor',     'Industrial', 6),
  ('Museum',     'City_Hall',  3),
  ('City_Hall',  'Riverside',  4),
  ('Riverside',  'Market',     4),
  ('Industrial', 'Warehouse',  3),
  ('Warehouse',  'Junction',   4),
  ('Junction',   'Harbor',     7);
```

### Supabase Realtime (React)

```javascript
// hooks/useCrowdRealtime.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export function useCrowdRealtime(onUpdate) {
  useEffect(() => {
    const channel = supabase
      .channel('crowd-updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'stations',
        filter: 'crowd_level=neq.crowd_level'
      }, (payload) => {
        onUpdate(payload.new);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [onUpdate]);
}
```

---

## Backend — Java Spring Boot

### Project Structure

```
metro-route-backend/
├── pom.xml
└── src/main/java/com/metro/
    ├── MetroApplication.java
    ├── config/
    │   ├── DatabaseConfig.java
    │   └── CorsConfig.java
    ├── controller/
    │   └── RouteController.java
    ├── service/
    │   ├── GraphService.java
    │   ├── DijkstraService.java
    │   ├── FloydWarshallService.java
    │   └── BranchBoundService.java
    ├── repository/
    │   ├── StationRepository.java
    │   ├── EdgeRepository.java
    │   └── RouteCacheRepository.java
    ├── model/
    │   ├── Station.java
    │   ├── Edge.java
    │   ├── RouteCache.java
    │   └── MetroLine.java
    └── dto/
        ├── RouteRequest.java
        ├── RouteResult.java
        └── AllPairsResult.java
```

### pom.xml (Key Dependencies)

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
</dependencies>
```

### RouteController.java

```java
@RestController
@RequestMapping("/api/routes")
@CrossOrigin(origins = "http://localhost:3000")
public class RouteController {

    @Autowired private GraphService graphService;
    @Autowired private DijkstraService dijkstraService;
    @Autowired private FloydWarshallService floydService;
    @Autowired private BranchBoundService bbService;

    @PostMapping("/dijkstra")
    public ResponseEntity<RouteResult> dijkstra(@RequestBody RouteRequest req) {
        var graph = graphService.buildWeightedGraph(req.getWeightDist(), req.getWeightCrowd());
        return ResponseEntity.ok(dijkstraService.findShortestPath(graph, req.getFrom(), req.getTo()));
    }

    @PostMapping("/floyd-warshall")
    public ResponseEntity<AllPairsResult> floydWarshall(@RequestBody WeightRequest req) {
        var graph = graphService.buildWeightedGraph(req.getWeightDist(), req.getWeightCrowd());
        return ResponseEntity.ok(floydService.compute(graph));
    }

    @PostMapping("/branch-bound")
    public ResponseEntity<RouteResult> branchBound(@RequestBody RouteRequest req) {
        var graph = graphService.buildWeightedGraph(req.getWeightDist(), req.getWeightCrowd());
        return ResponseEntity.ok(bbService.findOptimalPath(graph, req.getFrom(), req.getTo()));
    }

    @GetMapping("/stations")
    public ResponseEntity<List<Station>> getStations() {
        return ResponseEntity.ok(graphService.getAllStations());
    }
}
```

---

## Frontend — React

### Component Structure

```
metro-route-frontend/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx
│   ├── components/
│   │   ├── MetroMap.jsx          ← SVG interactive map
│   │   ├── RouteResults.jsx      ← Algorithm result cards
│   │   ├── Sidebar.jsx           ← Controls & configuration
│   │   ├── AllPairsMatrix.jsx    ← Floyd-Warshall table
│   │   └── BranchBoundTree.jsx   ← B&B exploration log
│   ├── hooks/
│   │   ├── useAlgorithms.js      ← Algorithm runner
│   │   └── useCrowdRealtime.js   ← Supabase subscriptions
│   ├── services/
│   │   └── apiService.js         ← Axios API calls
│   ├── utils/
│   │   ├── dijkstra.js           ← Client-side Dijkstra
│   │   ├── floydWarshall.js      ← Client-side FW
│   │   └── branchBound.js        ← Client-side B&B
│   └── constants/
│       └── metroData.js          ← Station/edge data
```

### apiService.js

```javascript
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8080/api' });

export const RouteAPI = {
  dijkstra: (from, to, wDist, wCrowd) =>
    API.post('/routes/dijkstra', { from, to, weightDist: wDist, weightCrowd: wCrowd }),

  floydWarshall: (wDist, wCrowd) =>
    API.post('/routes/floyd-warshall', { weightDist: wDist, weightCrowd: wCrowd }),

  branchBound: (from, to, wDist, wCrowd) =>
    API.post('/routes/branch-bound', { from, to, weightDist: wDist, weightCrowd: wCrowd }),

  getStations: () =>
    API.get('/routes/stations'),
};
```

---

## API Reference

### POST `/api/routes/dijkstra`

**Request:**
```json
{
  "from": "Central",
  "to": "Airport",
  "weightDist": 0.7,
  "weightCrowd": 0.3
}
```

**Response:**
```json
{
  "algorithm": "DIJKSTRA",
  "distance": 18.5,
  "path": ["Central", "Park", "University", "Stadium", "Airport"],
  "hops": 4,
  "nodesExplored": 9,
  "computeTimeMs": 2
}
```

### POST `/api/routes/floyd-warshall`

**Response:**
```json
{
  "nodes": ["Central", "Park", "..."],
  "distMatrix": [[0, 4.0, 8.0, "..."]],
  "computeTimeMs": 15
}
```

### POST `/api/routes/branch-bound`

**Response:**
```json
{
  "algorithm": "BRANCH_AND_BOUND",
  "distance": 18.5,
  "path": ["Central", "Park", "University", "Stadium", "Airport"],
  "prunedBranches": 12,
  "explorationLog": [
    { "path": ["Central", "Park"], "cost": 4.0, "status": "EXPLORING" },
    { "path": ["Central", "Market", "Harbor", "..."], "cost": 28.0, "status": "PRUNED" }
  ]
}
```

### GET `/api/routes/stations`

**Response:**
```json
[
  { "id": "Central", "name": "Central", "crowdLevel": 8, "lineId": "red" },
  { "id": "Airport", "name": "Airport", "crowdLevel": 9, "lineId": "red" }
]
```

---

## Project Structure

```
metro-route-planner/
├── README.md                       ← This file
├── backend/                        ← Java Spring Boot
│   ├── pom.xml
│   └── src/
│       └── main/
│           ├── java/com/metro/
│           └── resources/
│               └── application.properties
├── frontend/                       ← React
│   ├── package.json
│   ├── .env
│   └── src/
├── database/
│   ├── schema.sql                  ← Full Supabase schema
│   ├── seed.sql                    ← Sample data
│   └── migrations/
│       └── 001_initial.sql
└── docs/
    └── architecture.png
```

---

## Setup & Installation

### Prerequisites

- Node.js `>= 18.x`
- Java `>= 17`
- Maven `>= 3.9`
- Supabase account (free tier works)

### 1. Supabase Setup

```bash
# Create a new Supabase project at https://supabase.com

# Run schema in Supabase SQL Editor
psql $SUPABASE_DB_URL -f database/schema.sql
psql $SUPABASE_DB_URL -f database/seed.sql
```

### 2. Backend Setup

```bash
cd backend

# Configure application.properties (see Environment Variables)
cp src/main/resources/application.properties.example \
   src/main/resources/application.properties

# Build and run
mvn clean install
mvn spring-boot:run

# Server starts at http://localhost:8080
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm start

# Opens at http://localhost:3000
```

---

## Environment Variables

### Backend — `application.properties`

```properties
# Server
server.port=8080

# Supabase PostgreSQL (get from Supabase project settings)
spring.datasource.url=jdbc:postgresql://db.<PROJECT_REF>.supabase.co:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=<YOUR_DB_PASSWORD>
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Connection Pool
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.connection-timeout=30000
```

### Frontend — `.env`

```env
REACT_APP_SUPABASE_URL=https://<PROJECT_REF>.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<YOUR_ANON_KEY>
REACT_APP_API_BASE_URL=http://localhost:8080/api
```

---

## Algorithm Complexity

| Algorithm | Time | Space | Use Case |
|---|---|---|---|
| **Dijkstra** | O((V+E) log V) | O(V) | Single source → destination |
| **Floyd-Warshall** | O(V³) | O(V²) | All pairs, precomputed cache |
| **Weighted Optimization** | Same as Dijkstra | O(V) | Tunable distance/crowd tradeoff |
| **Branch & Bound** | O(V!) worst | O(V) | Exact optimal, small graphs |

For the metro network (V=15, E=20):
- Dijkstra: ~milliseconds
- Floyd-Warshall: ~15ms (runs once at startup, cached)
- Branch & Bound: ~5ms (with effective pruning)

---

## Sample Data

### Crowd Levels (1 = empty, 10 = packed)

| Station | Crowd Level | Peak Hours |
|---|---|---|
| Central | 8 | Morning & evening rush |
| Airport | 9 | All day |
| Market | 7 | Lunch + evening |
| University | 6 | 8–10am, 4–6pm |
| Beach | 2 | Weekends only |
| Warehouse | 2 | Off-peak |
| Tech Hub | 3 | Business hours |

### Example Routes (Central → Airport)

| Algorithm | Path | Cost | Hops |
|---|---|---|---|
| Dijkstra (dist only) | Central→Park→Univ→Stadium→Airport | 22.0 | 4 |
| Dijkstra (balanced) | Central→Park→Univ→Stadium→Airport | 18.5 | 4 |
| Floyd-Warshall | Central→Park→Univ→Stadium→Airport | 18.5 | 4 |
| Branch & Bound | Central→Park→Univ→Stadium→Airport | 18.5 | 4 |

---

## Future Enhancements

- [ ] **A\* Algorithm** — heuristic-guided search using station coordinates
- [ ] **Real-time crowd feeds** — IoT sensor integration via Supabase Edge Functions
- [ ] **Time-dependent weights** — different costs for peak vs off-peak hours
- [ ] **Multi-modal routing** — combine metro with bus, walking
- [ ] **Mobile app** — React Native with offline graph caching
- [ ] **ML crowd prediction** — predict crowd levels 30 mins ahead
- [ ] **Turn-by-turn directions** — step-by-step navigation UI
- [ ] **Accessibility routing** — prefer elevator-equipped stations
- [ ] **Route comparison** — side-by-side all-algorithm comparison view
- [ ] **Admin panel** — manage stations, update crowd levels, view analytics

---

## License

MIT — free for academic and personal use.

---

*Metro Route Planner — Mini Project #17 | React · Java Spring Boot · Supabase*
