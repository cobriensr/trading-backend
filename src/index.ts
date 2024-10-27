import { buildApp } from './app';

const startServer = async (): Promise<void> => {
  try {
    const app = await buildApp();
    await app.listen({ port: 3000, host: '0.0.0.0' });
    // eslint-disable-next-line no-console
    console.log('Server is running on http://localhost:3000');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

void startServer();
