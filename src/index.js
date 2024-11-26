import dotenv from 'dotenv';
import { initMongoConnection } from './db/initMongoConnection';
import { setupServer } from './server';
dotenv.config();

const startServer = async () => {
  try {
    console.log('Initializing MongoDB connection...');
    await initMongoConnection();
    console.log('MongoDB connected:)');
    const app = setupServer();

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`SERVER IS RUNNING ON PORT ${PORT}`);
    });
  } catch (error) {
    console.log('Failed to start server:', error);
  }
};

startServer();
