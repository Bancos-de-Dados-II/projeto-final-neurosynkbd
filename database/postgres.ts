import { Pool } from 'pg';
import dotenv from 'dotenv';


dotenv.config();


export const pgPool = new Pool({
  connectionString: process.env.POSTGRES_URI,
});


export const connectPostgres = async (): Promise<void> => {
  try {
    const client = await pgPool.connect();
    console.log('[PostgreSQL] Conectado com sucesso!');
    client.release();
  } catch (error) {
    console.error('[PostgreSQL] Erro ao conectar no banco:', error);
  }
};