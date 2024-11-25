import dotenv from 'dotenv';
dotenv.config();

const {} = process.env;

const mongoURI = ``;

export const initMongoConnection = async () => {
  try {
    console.log('MONGO CONNECTION SUCCESSFULLY ESTABLISHED!');
  } catch (error) {
    console.error('MONGO CONNECTION FAILED:', error.message);
    throw error;
  }
};
