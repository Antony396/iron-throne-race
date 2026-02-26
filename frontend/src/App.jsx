import { useState } from 'react'
import './App.css'

function App() {
  const [votes, setVotes] = useState({
    jon: 0, dany: 0, tywin: 0, tyrion: 0, bran: 0, 
    robert: 0, stannis: 0, arya: 0, sansa: 0, ramsay: 0
  });

  const GOAL = 100;

  // Added 'color' to each character
  const characters = [
    { id: 'jon', name: 'Jon', icon: '❄️', color: '#87CEEB' },      // Stark Ice Blue
    { id: 'dany', name: 'Dany', icon: '🔥', color: '#c94204' },     // Targaryen Red
    { id: 'tyrion', name: 'Tyrion', icon: '🍷', color: '#68052b' }, // Lannister Crimson
    { id: 'tywin', name: 'Tywin', icon: '🦁', color: '#9e8809' },   // Lannister Gold
    { id: 'arya', name: 'Arya', icon: '🗡️', color: '#708090' },    // Stark Grey
    { id: 'sansa', name: 'Sansa', icon: '👑', color: '#504466' },   // Purple
    { id: 'bran', name: 'Bran', icon: '👁️', color: '#0d530d' },    // Weirwood Green
    { id: 'stannis', name: 'Stannis', icon: '🦌', color: '#ff8c0086' }, // Baratheon Orange/Fire
    { id: 'robert', name: 'Robert', icon: '🍺', color: '#f0ae08' },  // Baratheon Gold
    { id: 'ramsay', name: 'Ramsay', icon: '🌭', color: '#8b0000' },  // Bolton Blood Red
  ];

  const handleVote = (id) => {
    if (votes[id] < GOAL) setVotes(prev => ({ ...prev, [id]: prev[id] + 1 }));
  };

  const handleReset = () => {
    if (window.confirm("My Lord, shall we restart the war?")) {
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
        <p className="description">Solid lines represent the path of destiny for each Great House.</p>
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
                  {/* Future Path: Faint solid house-colored line */}
                  <line 
                    x1={xPos} y1={yPos} x2="0" y2="0" 
                    className="path-faded" 
                    style={{ stroke: char.color, opacity: 0.15 }} 
                  />
                  {/* Traveled Path: Bright solid house-colored line */}
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
            <span className="throne-icon">🪑</span>
          </div>

          {characters.map((char, index) => {
            const angle = (index / characters.length) * 2 * Math.PI;
            const currentR = 280 * (1 - votes[char.id] / GOAL);
            const x = Math.cos(angle) * currentR;
            const y = Math.sin(angle) * currentR;

            return (
              <div 
                key={char.id} 
                className="circle-token"
                style={{ 
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  color: char.color 
                }}
              >
                <span className="char-emoji">{char.icon}</span>
                <div className="char-label" style={{ borderColor: char.color }}>{char.name}</div>
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
              <span className="btn-count" style={{ color: char.color }}>{votes[char.id]}</span>
            </button>
          ))}
        </div>
      </aside>

      <button className="floating-reset" onClick={handleReset}>🔄</button>
    </div>
  )
}

export default App;