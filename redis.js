import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Instancia o cliente usando a URL configurada
const redis = new Redis(process.env.REDIS_URL, {
  // Opções úteis para manter a estabilidade na nuvem:
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  console.log('⚡ Conectado ao Redis Cloud com sucesso!');
});

redis.on('error', (err) => {
  console.error('❌ Erro na conexão com o Redis Cloud:', err);
});

export default redis;