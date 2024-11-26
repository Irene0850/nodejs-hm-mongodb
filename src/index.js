import dotenv from 'dotenv';
dotenv.config();

import { initMongoConnection } from './db/initMongoConnection.js';

import { setupServer } from './server.js';

const startServer = async () => {
  try {
    console.log('Initializing MongoDB connection...');
    await initMongoConnection();
    console.log('MongoDB connected:)');

    const app = setupServer();

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`SERVER IS RUNNING ON PORT ${PORT}`);
    });
  } catch (error) {
    console.log('Failed to start server:', error);
  }
};

startServer();
