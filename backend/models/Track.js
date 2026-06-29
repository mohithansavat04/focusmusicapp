import mongoose from 'mongoose';

const trackSchema = new mongoose.Schema({
  title: { type: String },
  artist: { type: String },
  artworkUrl: { type: String, default: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoXC3rxrBb3NpNG-sr3Ab1xcnkfpFWEQC-g-bKlG4G3uSDTGOljIRfasB5IG4pqTC4TkBMyd1L3n7qLhxInm4q2g8Um1sYcrY_XAH-OYmXN45cRblKB0zP3myYNJ-cZ0d73scCdDnNs3YV6XRFjadtllQIi7nBoFPc5mGHS-Zf3DgbuNnlIEBtupuwUpiO9pJ4YrxvgVdnDXmm1HVyiYTeZnLNVZun2IW5pp-8ng-HFWvf_x-8YcgciO3uiSmgdibRUDI_Si1Yya4f' },
  audioUrl: { type: String },
  fileKey: { type: String },
  fileMime: { type: String },
  fileBucket: { type: String },
  fileSize: { type: Number },
  duration: { type: Number }
}, { timestamps: true });

export default mongoose.model('Track', trackSchema);
