import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}) 

# Database configuration
database_url = os.environ.get('DATABASE_URL', 'sqlite:///throne_votes_v2.db')
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- MODELS ---
class VoteRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    voter_uuid = db.Column(db.String(100), unique=True, nullable=False)
    votes_cast = db.Column(db.Integer, default=0)

class CharacterVote(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    count = db.Column(db.Integer, default=0)

# --- ROUTES ---

@app.route('/api/citadel-reset-secret-99', methods=['POST'])
def secret_reset():
    # 1. Clear character scores
    characters = CharacterVote.query.all()
    for char in characters:
        char.count = 0
    # 2. Wipe voting history
    VoteRecord.query.delete()
    db.session.commit()
    return jsonify({"message": "The slate has been wiped clean, My Lord."})

@app.route('/api/votes', methods=['GET'])
def get_votes():
    votes = CharacterVote.query.all()
    return jsonify({v.id: v.count for v in votes})

@app.route('/api/voter-status', methods=['GET'])
def get_voter_status():
    voter_uuid = request.args.get('voterId') 
    if not voter_uuid:
        return jsonify({"votes_used": 0})
    voter = VoteRecord.query.filter_by(voter_uuid=voter_uuid).first()
    return jsonify({"votes_used": voter.votes_cast if voter else 0})

@app.route('/api/vote', methods=['POST'])
def cast_vote():
    data = request.json
    char_id = data.get('characterId')
    voter_uuid = data.get('voterId')

    if not voter_uuid:
        return jsonify({"error": "No voter ID provided"}), 400

    voter = VoteRecord.query.filter_by(voter_uuid=voter_uuid).first()
    if not voter:
        voter = VoteRecord(voter_uuid=voter_uuid, votes_cast=0)
        db.session.add(voter)
        db.session.flush()

    if voter.votes_cast >= 3:
        return jsonify({"error": "Influence exhausted!", "remaining": 0}), 403

    character = CharacterVote.query.get(char_id)
    if character:
        character.count += 1
        voter.votes_cast += 1 
        db.session.commit()
        return jsonify({
            "success": True, 
            "new_count": character.count,
            "votes_used": voter.votes_cast
        })
    return jsonify({"error": "Character not found"}), 404

# --- DATABASE INITIALIZATION ---
with app.app_context():
    db.create_all()
    if not CharacterVote.query.first():
        characters = ['jon', 'dany', 'tywin', 'tyrion', 'bran', 'robert', 'stannis', 'arya', 'sansa', 'ramsay']
        for char_id in characters:
            db.session.add(CharacterVote(id=char_id, count=0))
        db.session.commit()

if __name__ == '__main__':
    app.run(debug=True, port=5000)