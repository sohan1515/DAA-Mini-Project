import { useState } from 'react';
import { MetroMap } from './components/MetroMap';
import { Sidebar } from './components/Sidebar';
import { RouteResults } from './components/RouteResults';
import { AllPairsMatrix } from './components/AllPairsMatrix';
import { BranchBoundTree } from './components/BranchBoundTree';
import { useAlgorithms } from './hooks/useAlgorithms';

function App() {
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [weightDist, setWeightDist] = useState(0.7);
  const [weightCrowd, setWeightCrowd] = useState(0.3);
  const [activeTab, setActiveTab] = useState('results');
  const [showModal, setShowModal] = useState(false);
  
  const { results, loading, runAllAlgorithms } = useAlgorithms();

  const handleRun = () => {
    if (fromStation && toStation) {
      runAllAlgorithms(fromStation, toStation, weightDist, weightCrowd);
    }
  };

  const highlightedPath = activeTab === 'tree'
    ? results.branchBound?.path || results.dijkstra?.path || []
    : results.dijkstra?.path || [];

  return (
    <div className="app">
      <Sidebar
        fromStation={fromStation}
        toStation={toStation}
        onFromChange={setFromStation}
        onToChange={setToStation}
        weightDist={weightDist}
        weightCrowd={weightCrowd}
        onWeightDistChange={setWeightDist}
        onWeightCrowdChange={setWeightCrowd}
        onRun={handleRun}
        loading={loading}
      />
      
      <main className="main-content">
        <div className="map-container">
          <MetroMap 
            highlightedPath={highlightedPath}
            weightDist={weightDist}
            weightCrowd={weightCrowd}
            onStationClick={(station) => {
              if (!fromStation) {
                setFromStation(station.id);
              } else if (!toStation) {
                setToStation(station.id);
              }
            }}
          />
        </div>
        
        <div className="algorithms-button-container">
          <button 
            className="algorithms-button"
            onClick={() => setShowModal(true)}
          >
            📊 Show Algorithms
          </button>
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Algorithms Analysis</h2>
                <button 
                  className="modal-close"
                  onClick={() => setShowModal(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="tabs">
                <button 
                  className={`tab ${activeTab === 'results' ? 'active' : ''}`}
                  onClick={() => setActiveTab('results')}
                >
                  Results
                </button>
                <button 
                  className={`tab ${activeTab === 'matrix' ? 'active' : ''}`}
                  onClick={() => setActiveTab('matrix')}
                >
                  Distance Matrix
                </button>
                <button 
                  className={`tab ${activeTab === 'tree' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tree')}
                >
                  B&B Tree
                </button>
              </div>
              
              <div className="tab-content">
                {activeTab === 'results' && <RouteResults results={results} />}
                {activeTab === 'matrix' && <AllPairsMatrix allPairs={results.allPairs} />}
                {activeTab === 'tree' && <BranchBoundTree result={results.branchBound} />}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;