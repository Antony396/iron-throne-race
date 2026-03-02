import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)

# This allows your Vercel URL to talk to this API
CORS(app, resources={r"/api/*": {"origins": "*"}}) 

# Database configuration
database_url = os.environ.get('DATABASE_URL', 'sqlite:///throne_votes.db')
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- MODELS ---
class VoteRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(100), unique=True, nullable=False)

class CharacterVote(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    count = db.Column(db.Integer, default=0)

# --- ROUTES ---

# NEW: This sends the current scores to your React app on page load
@app.route('/api/votes', methods=['GET'])
def get_votes():
    votes = CharacterVote.query.all()
    # Converts database rows into a simple object: { "jon": 5, "dany": 10... }
    return jsonify({v.id: v.count for v in votes})

@app.route('/api/vote', methods=['POST'])
def cast_vote():
    data = request.json
    char_id = data.get('characterId')
    
    # Get the real IP address of the user
    user_ip = request.headers.get('X-Forwarded-For', request.remote_addr).split(',')[0]

    if VoteRecord.query.filter_by(ip_address=user_ip).first():
        return jsonify({"error": "You have already cast your claim!"}), 403

    character = CharacterVote.query.get(char_id)
    if character:
        character.count += 1
        db.session.add(VoteRecord(ip_address=user_ip))
        db.session.commit()
        return jsonify({"success": True, "new_count": character.count})
    
    return jsonify({"error": "Character not found"}), 404

# --- DATABASE INITIALIZATION ---
# This runs once when the app starts up
with app.app_context():
    db.create_all()
    # If the table is empty, add the characters so the counts start at 0
    if not CharacterVote.query.first():
        characters = ['jon', 'dany', 'tywin', 'tyrion', 'bran', 'robert', 'stannis', 'arya', 'sansa', 'ramsay']
        for char_id in characters:
            db.session.add(CharacterVote(id=char_id, count=0))
        db.session.commit()

if __name__ == '__main__':
    # Local development port
    app.run(debug=True, port=5000)