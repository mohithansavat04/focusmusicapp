import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  coverUrl: { type: String },
  tracks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Playlist', playlistSchema);
