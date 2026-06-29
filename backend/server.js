import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import setupAdmin from './admin.js';
import Track from './models/Track.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('public/uploads'));

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/focusmusic')
  .then(async () => {
    console.log('MongoDB connected successfully');
    
    // Setup AdminJS AFTER DB connection
    await setupAdmin(app);

    // API Routes
    app.get('/api/tracks', async (req, res) => {
      try {
        const { search } = req.query;
        let query = {};
        if (search) {
          query = { 
            $or: [
              { title: { $regex: search, $options: 'i' } },
              { artist: { $regex: search, $options: 'i' } }
            ]
          };
        }
        const tracks = await Track.find(query).limit(50);
        
        // Map to match React Native Track interface
        const formattedTracks = tracks.map(t => ({
          id: t._id.toString(),
          title: t.title,
          artist: t.artist,
          artwork: t.artworkUrl,
          previewUrl: t.audioUrl || (t.fileKey ? `/uploads/${t.fileKey}` : null),
          duration: t.duration
        }));
        
        res.json(formattedTracks);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.get('/', (req, res) => {
      res.send('Focus Music API is running. Go to /admin to manage the app.');
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Admin Panel available at http://localhost:${PORT}/admin`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));
