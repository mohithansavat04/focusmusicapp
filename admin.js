import { AdminJS, ComponentLoader } from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSMongoose from '@adminjs/mongoose';
import uploadFeature from '@adminjs/upload';
import * as mm from 'music-metadata';
import path from 'path';

// Import models
import User from './models/User.js';
import Track from './models/Track.js';
import Playlist from './models/Playlist.js';

// Register the mongoose adapter
AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database,
});

import { LocalProvider } from '@adminjs/upload';
import fs from 'fs';

class CrossDeviceLocalProvider extends LocalProvider {
  async upload(file, key) {
    const filePath = process.platform === 'win32' ? this.path(key) : this.path(key).slice(1);
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    try {
      await fs.promises.rename(file.path, filePath);
    } catch (error) {
      if (error.code === 'EXDEV') {
        await fs.promises.copyFile(file.path, filePath);
        await fs.promises.unlink(file.path);
      } else {
        throw error;
      }
    }
  }
}

const componentLoader = new ComponentLoader();

const setupAdmin = async (app) => {
  const localProvider = new CrossDeviceLocalProvider({
    bucket: 'public/uploads',
    opts: {
      baseUrl: '/uploads',
    },
  });

  const admin = new AdminJS({
    componentLoader,
    resources: [
      User, 
      {
        resource: Track,
        options: {
          properties: {
            fileKey: { isVisible: false },
            fileMime: { isVisible: false },
            fileBucket: { isVisible: false },
            fileSize: { isVisible: false },
            audioUrl: { isVisible: { list: true, show: true, edit: false, filter: true } },
            artworkUrl: { isVisible: { list: true, show: true, edit: false, filter: false } },
            createdAt: { isVisible: { list: true, show: true, edit: false, filter: true } },
            updatedAt: { isVisible: { list: true, show: true, edit: false, filter: true } },
          },
          actions: {
            new: {
              after: async (response, request, context) => {
                if (request.method === 'post' && response.record && response.record.params.fileKey) {
                  try {
                    const filePath = path.join(process.cwd(), 'public/uploads', response.record.params.fileKey);
                    const metadata = await mm.parseFile(filePath);
                    
                    const trackId = response.record.params._id;
                    const update = {};
                    
                    if (!response.record.params.title) {
                      update.title = metadata.common.title || response.record.params.fileKey.split('/').pop().replace(/\.[^/.]+$/, "");
                    }
                    
                    if (!response.record.params.artist) {
                      update.artist = metadata.common.artist || 'Unknown Artist';
                    }
                    
                    if (metadata.format.duration) {
                      update.duration = metadata.format.duration;
                    }
                    
                    update.audioUrl = `/uploads/${response.record.params.fileKey}`;

                    if (Object.keys(update).length > 0) {
                      await Track.findByIdAndUpdate(trackId, update);
                    }
                  } catch (error) {
                    console.error('Error extracting metadata:', error);
                  }
                }
                return response;
              }
            }
          }
        },
        features: [
          uploadFeature({
            componentLoader,
            provider: localProvider,
            properties: {
              key: 'fileKey',
              mimeType: 'fileMime',
              bucket: 'fileBucket',
              size: 'fileSize',
              file: 'file', // Virtual field for the file upload
            },
            validation: {
              mimeTypes: ['audio/wav', 'audio/x-wav', 'audio/mpeg', 'audio/mp3'],
            }
          }),
        ],
      }, 
      Playlist
    ],
    rootPath: '/admin',
    branding: {
      companyName: 'Focus Music Admin',
      softwareBrothers: false,
    },
  });

  // Force bundling in production to fix "Component has not been bundled" errors on Render
  const originalNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'development';
  admin.watch();
  process.env.NODE_ENV = originalNodeEnv;
  
  const adminRouter = AdminJSExpress.buildRouter(admin);
  app.use(admin.options.rootPath, adminRouter);
};

export default setupAdmin;
