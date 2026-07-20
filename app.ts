import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);
import express, { Application } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import UsuarioRouter from './router/usuario-router.js';
import { conectarMongo } from './database/mongodb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Application = express();
const port: number = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/usuarios', UsuarioRouter);

async function inicializarServidor() {
  try {
    await conectarMongo();
    app.listen(port, () => {
      console.log(`🍃 Servidor focado no MongoDB pronto!`);
      console.log(`🚀 NeuroSync rodando em: http://localhost:${port}`);
    });

  } catch (error) {
    console.error("❌ Falha Crítica na inicialização:", error);
    process.exit(1);
  }
}

inicializarServidor();