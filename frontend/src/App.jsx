import { useState } from 'react'
import './App.css'

function App() {
  const [votes, setVotes] = useState({
    jon: 0, dany: 0, tywin: 0, tyrion: 0, bran: 0, 
    robert: 0, stannis: 0, arya: 0, sansa: 0, ramsay: 0
  });

  const GOAL = 100;
  const characters = [
    { id: 'jon', name: 'Jon', icon: '❄️' },
    { id: 'dany', name: 'Dany', icon: '🔥' },
    { id: 'tyrion', name: 'Tyrion', icon: '🍷' },
    { id: 'tywin', name: 'Tywin', icon: '🦁' },
    { id: 'arya', name: 'Arya', icon: '🗡️' },
    { id: 'sansa', name: 'Sansa', icon: '👑' },
    { id: 'bran', name: 'Bran', icon: '👁️' },
    { id: 'stannis', name: 'Stannis', icon: '🦌' },
    { id: 'robert', name: 'Robert', icon: '🍺' },
    { id: 'ramsay', name: 'Ramsay', icon: '🌭' },
  ];

  const handleVote = (id) => {
    if (votes[id] < GOAL) setVotes(prev => ({ ...prev, [id]: prev[id] + 1 }));
  };

  const handleReset = () => {
    if (window.confirm("Restart the history of Westeros?")) {
      const resetVotes = {};
      characters.forEach(c => resetVotes[c.id] = 0);
      setVotes(resetVotes);
    }
  };

  return (
    <div className="war-room">
      <div className="texture-overlay"></div>

      {/* LEFT SIDEBAR: Title */}
      <aside className="sidebar left-side">
        <h1 className="title">Race for the <br/><span>Iron Throne</span></h1>
        <p className="description">First to 100 votes claims the Seven Kingdoms.</p>
      </aside>

      {/* CENTER: The Circle Arena */}
      <main className="arena-container">
        <div className="arena-anchor">
          <div className="throne-center">
            <div className="throne-glow"></div>
            <span className="throne-icon">🪑</span>
          </div>

          {characters.map((char, index) => {
            const angle = (index / characters.length) * 2 * Math.PI;
            const startRadius = 260; 
            const currentRadius = startRadius * (1 - votes[char.id] / GOAL);
            const x = Math.cos(angle) * currentRadius;
            const y = Math.sin(angle) * currentRadius;

            return (
              <div 
                key={char.id} 
                className="circle-token"
                style={{
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              >
                <span className="char-emoji">{char.icon}</span>
                <div className="char-label">{char.name}</div>
              </div>
            );
          })}
        </div>
      </main>

      {/* RIGHT SIDEBAR: Controls */}
      <aside className="sidebar right-side">
        <h3 className="sidebar-heading">Cast Your Vote</h3>
        <div className="controls-stack">
          {characters.map((char) => (
            <button key={char.id} className="vote-btn" onClick={() => handleVote(char.id)}>
              <span className="btn-icon">{char.icon}</span>
              <span className="btn-name">{char.name}</span>
              <span className="btn-count">{votes[char.id]}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* FLOATING RESET BUTTON */}
      <button className="floating-reset" onClick={handleReset} title="Reset the Realm">
        🔄
      </button>
    </div>
  )
}

export default App;