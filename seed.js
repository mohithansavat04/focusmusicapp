import mongoose from 'mongoose';
import Track from './models/Track.js';

const dummyTracks = [
  {
    title: 'Lofi Study Beat',
    artist: 'ChillHop Vibes',
    artworkUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 372
  },
  {
    title: 'Midnight Coffee',
    artist: 'Lofi Girl',
    artworkUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 420
  },
  {
    title: 'Autumn Leaves',
    artist: 'Jazz Beats',
    artworkUrl: 'https://images.unsplash.com/photo-1507676184212-d0330a151f15?w=500',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: 345
  },
  {
    title: 'Rainy Window',
    artist: 'Sleepy Tunes',
    artworkUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=500',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    duration: 301
  },
  {
    title: 'Morning Breeze',
    artist: 'Chillhop Music',
    artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    duration: 333
  },
  {
    title: 'Neon Nights',
    artist: 'Synthwave Chill',
    artworkUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=500',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    duration: 412
  },
  {
    title: 'Ocean Waves',
    artist: 'Nature Sounds',
    artworkUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    duration: 388
  },
  {
    title: 'City Lights',
    artist: 'Urban Lofi',
    artworkUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    duration: 350
  },
  {
    title: 'Cozy Fireplace',
    artist: 'Winter Beats',
    artworkUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?w=500',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    duration: 310
  },
  {
    title: 'Sunset Drive',
    artist: 'Vaporwave Vibes',
    artworkUrl: 'https://images.unsplash.com/photo-1504198458649-3128b932f49e?w=500',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    duration: 400
  }
];

mongoose.connect('mongodb://127.0.0.1:27017/focusmusic')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Clear existing tracks
    await Track.deleteMany({});
    
    // Insert dummy tracks
    await Track.insertMany(dummyTracks);
    
    console.log('Successfully inserted 10 dummy tracks!');
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
