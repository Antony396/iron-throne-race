import { useState, useEffect } from 'react' // Added useEffect to the import
import './App.css'
import throneImg from './assets/throne.png' 

// Make sure this matches your Render URL exactly (check if you need /api at the end)
const API_BASE_URL = "https://iron-throne-race.onrender.com/api";

function App() {
  const [votes, setVotes] = useState({
    jon: 0, dany: 0, tywin: 0, tyrion: 0, bran: 0, 
    robert: 0, stannis: 0, arya: 0, sansa: 0, ramsay: 0
  });

  const GOAL = 100;

  const characters = [
    { id: 'jon', name: 'Jon', icon: '❄️', color: '#87cfebb6' },
    { id: 'dany', name: 'Dany', icon: '🔥', color: '#c94204ad' },
    { id: 'tyrion', name: 'Tyrion', icon: '🍷', color: '#68052b' },
    { id: 'tywin', name: 'Tywin', icon: '🦁', color: '#9e8809b7' },
    { id: 'arya', name: 'Arya', icon: '🗡️', color: '#708090c5' },
    { id: 'sansa', name: 'Sansa', icon: '👑', color: '#504466bb' },
    { id: 'bran', name: 'Bran', icon: '👁️', color: '#0d530db0' },
    { id: 'stannis', name: 'Stannis', icon: '🦌', color: '#ff8c00b6' },
    { id: 'robert', name: 'Robert', icon: '🍺', color: '#f0ae08b4' },
    { id: 'ramsay', name: 'Ramsay', icon: '🌭', color: '#8b0000ab' },
  ];

  // 1. FETCH VOTES ON LOAD
  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/votes`);
        if (response.ok) {
          const data = await response.json();
          setVotes(data);
        }
      } catch (error) {
        console.error("The Citadel is unreachable:", error);
      }
    };
    fetchVotes();
  }, []);

  // 2. HANDLE VOTING
  const handleVote = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId: id })
      });

      const data = await response.json();

      if (response.ok) {
        setVotes(prev => ({ ...prev, [id]: data.new_count }));
        alert("Your claim has been recorded in the Great Ledger!");
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("The ravens are lost. Is the backend server awake?");
    }
  };

  const handleReset = () => {
    if (window.confirm("My Lord, shall we restart the war?")) {
      // Note: You might want a backend route for this eventually to clear the DB!
      const resetVotes = {};
      characters.forEach(c => resetVotes[c.id] = 0);
      setVotes(resetVotes);
    }
  };

  return (
    <div className="war-room">
      <div className="texture-overlay"></div>

      <aside className="sidebar left-side">
        <h1 className="title">Race for the <br/><span>Iron Throne</span></h1>
        <p className="description">Solid lines represent the path of destiny.</p>
      </aside>

      <main className="arena-container">
        <div className="arena-anchor">
          
          <svg className="arena-svg" viewBox="-350 -350 700 700">
            {characters.map((char, index) => {
              const angle = (index / characters.length) * 2 * Math.PI;
              const maxR = 280; 
              const xEdge = Math.cos(angle) * maxR;
              const yEdge = Math.sin(angle) * maxR;
              
              const travelR = maxR * (1 - votes[char.id] / GOAL);
              const xPos = Math.cos(angle) * travelR;
              const yPos = Math.sin(angle) * travelR;

              return (
                <g key={`path-${char.id}`}>
                  <line 
                    x1={xPos} y1={yPos} x2="0" y2="0" 
                    className="path-faded" 
                    style={{ stroke: char.color, opacity: 0.15 }} 
                  />
                  <line 
                    x1={xEdge} y1={yEdge} x2={xPos} y2={yPos} 
                    className="path-traveled" 
                    style={{ stroke: char.color }}
                  />
                </g>
              );
            })}
          </svg>

          <div className="throne-center">
            <div className="throne-glow"></div>
            <img src={throneImg} alt="Iron Throne" className="throne-image" />
          </div>

          {characters.map((char, index) => {
            const angle = (index / characters.length) * 2 * Math.PI;
            const currentR = 280 * (1 - (votes[char.id] || 0) / GOAL);
            const x = Math.cos(angle) * currentR;
            const y = Math.sin(angle) * currentR;

            return (
              <div 
                key={char.id} 
                className="circle-token"
                style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
              >
                <span className="char-emoji">{char.icon}</span>
                <div 
                  className="char-label" 
                  style={{ 
                    borderColor: char.color,
                    boxShadow: `0 0 10px ${char.color}`
                  }}
                >
                  {char.name}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <aside className="sidebar right-side">
        <h3 className="sidebar-heading">Cast Your Vote</h3>
        <div className="controls-stack">
          {characters.map((char) => (
            <button 
              key={char.id} 
              className="vote-btn" 
              onClick={() => handleVote(char.id)}
              style={{ borderLeft: `4px solid ${char.color}` }}
            >
              <span className="btn-icon">{char.icon}</span>
              <span className="btn-name">{char.name}</span>
              <span className="btn-count" style={{ color: char.color }}>{votes[char.id] || 0}</span>
            </button>
          ))}
        </div>
      </aside>

      <button className="floating-reset" onClick={handleReset}>🔄</button>
    </div>
  )
}

export default App;