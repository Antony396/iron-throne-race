import { useState, useEffect } from 'react'
import './App.css'
import throneImg from './assets/throne.png' 

const API_BASE_URL = "https://iron-throne-race.onrender.com/api";

// HELPER: Creates a unique ID for this specific browser/device
const getVoterId = () => {
  let id = localStorage.getItem('throne_voter_id');
  if (!id) {
    id = crypto.randomUUID(); 
    localStorage.setItem('throne_voter_id', id);
  }
  return id;
};

function App() {
  const [votes, setVotes] = useState({
    jon: 0, dany: 0, tywin: 0, tyrion: 0, bran: 0, 
    robert: 0, stannis: 0, arya: 0, sansa: 0, ramsay: 0
  });

  const [userVotesUsed, setUserVotesUsed] = useState(0);
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

  useEffect(() => {
    const init = async () => {
      const voterId = getVoterId();
      try {
        const resVotes = await fetch(`${API_BASE_URL}/votes`);
        if (resVotes.ok) setVotes(await resVotes.json());

        // Pass voterId to get the count for THIS device
        const resStatus = await fetch(`${API_BASE_URL}/voter-status?voterId=${voterId}`);
        if (resStatus.ok) {
          const status = await resStatus.json();
          setUserVotesUsed(status.votes_used);
        }
      } catch (e) { console.error("Error fetching:", e); }
    };
    init();
  }, []);

  const handleVote = async (id) => {
    if (userVotesUsed >= 3) return; // Silent lock

    const voterId = getVoterId();

    try {
      const response = await fetch(`${API_BASE_URL}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          characterId: id,
          voterId: voterId 
        })
      });

      if (response.ok) {
        const data = await response.json();
        setVotes(prev => ({ ...prev, [id]: data.new_count }));
        setUserVotesUsed(data.votes_used);
      } else {
        const err = await response.json();
        alert(err.error);
      }
    } catch (error) {
      console.error("The raven fell:", error);
    }
  };

 

  return (
    <div className="war-room">
      <div className="texture-overlay"></div>

      <aside className="sidebar left-side">
        <h1 className="title">Race for the <br/><span>Iron Throne</span></h1>
        <p className="description">Solid lines represent the path of destiny.</p>
        
        <div style={{ marginTop: 'auto', paddingBottom: '20px', borderTop: '1px solid rgba(212, 175, 55, 0.2)', paddingTop: '30px' }}>
          <h3 style={{ fontFamily: 'Cinzel', color: '#d4af37', fontSize: '1rem', letterSpacing: '2px' }}>Your Influence</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', margin: '10px 0', fontFamily: 'Cinzel' }}>
            {userVotesUsed} <span style={{ fontSize: '1rem', color: '#444' }}>/ 3</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#888', fontStyle: 'italic' }}>
            {userVotesUsed >= 3 ? "Your claim is sealed in blood." : "Points of influence remaining."}
          </p>
        </div>
      </aside>

      <main className="arena-container">
        <div className="arena-anchor">
          <svg className="arena-svg" viewBox="-350 -350 700 700">
            {characters.map((char, index) => {
              const angle = (index / characters.length) * 2 * Math.PI;
              const maxR = 280; 
              const xEdge = Math.cos(angle) * maxR;
              const yEdge = Math.sin(angle) * maxR;
              const travelR = maxR * (1 - (votes[char.id] || 0) / GOAL);
              const xPos = Math.cos(angle) * travelR;
              const yPos = Math.sin(angle) * travelR;

              return (
                <g key={`path-${char.id}`}>
                  <line x1={xPos} y1={yPos} x2="0" y2="0" className="path-faded" style={{ stroke: char.color, opacity: 0.15 }} />
                  <line x1={xEdge} y1={yEdge} x2={xPos} y2={yPos} className="path-traveled" style={{ stroke: char.color }} />
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
                <div className="char-label" style={{ borderColor: char.color, boxShadow: `0 0 10px ${char.color}` }}>
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
              disabled={userVotesUsed >= 3} 
              style={{ 
                borderLeft: `4px solid ${char.color}`,
                opacity: userVotesUsed >= 3 ? 0.3 : 1, 
                cursor: userVotesUsed >= 3 ? 'default' : 'pointer'
              }}
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