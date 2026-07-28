import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pgPool = new Pool({
  user: 'neondb_owner',
  password: 'npg_bHJ5DuNEknq9', // <--- Remova o '@ep-muddy...' daqui!
  host: 'ep-muddy-darkness-ay2bft38.c-5.us-east-2.aws.neon.tech',
  port: 5432,
  database: 'neondb',
  ssl: {
    rejectUnauthorized: false
  }
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