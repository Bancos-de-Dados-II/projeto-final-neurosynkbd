import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

export const pgPool = new Pool({
  connectionString: process.env.POSTGRES_URI,
  ssl: {
    rejectUnauthorized: false, 
  },
});

export const connectPostgres = async (): Promise<void> => {
  try {
    const client = await pgPool.connect();
    console.log('[PostgreSQL] Conectado com sucesso ao Neon!');
    client.release();
  } catch (error) {
    console.error('[PostgreSQL] Erro ao conectar no banco:', error);
  }
};