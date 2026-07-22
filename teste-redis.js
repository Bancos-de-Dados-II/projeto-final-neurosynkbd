import redis from './redis.js';

async function testar() {
  try {
    // 1. Grava uma chave de teste
    await redis.set('teste_conexao', 'O Redis está funcionando perfeitamente!');

    // 2. Lê a chave de teste
    const resultado = await redis.get('teste_conexao');
    console.log('🔍 Valor lido do Redis:', resultado);

    process.exit(0);
  } catch (error) {
    console.error('Erro durante o teste:', error);
    process.exit(1);
  }
}

testar();