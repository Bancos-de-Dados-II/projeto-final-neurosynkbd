
import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);
import express, { type Application } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { conectarMongo } from './database/mongodb.js';
import { connectPostgres } from './database/postgres.js';
import UsuarioRouter from './router/usuario-router.js';
import CuidadorRouter from './router/cuidador-router.js';
import PacienteRouter from './router/paciente-router.js';
import TerapeutaRouter from './router/terapeuta-router.js';
import BotaoToTravadoRouter from './router/botaoToTravado-router.js';
import LocalizacaoRouter from './router/localizacao-router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Application = express();
app.use(cors());
const port: number = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/usuarios', UsuarioRouter);
app.use('/localizacao', LocalizacaoRouter);
app.use('/cuidador', CuidadorRouter);
app.use('/paciente', PacienteRouter);
async function inicializarServidor() {
  try {
    await conectarMongo();
    await connectPostgres();
    app.listen(port, () => {
      console.log(`🍃 Servidor focado no MongoDB e PostgreSQL pronto!`);
      console.log(`🚀 NeuroSync rodando em: http://localhost:${port}`);
    });

  } catch (error) {
    console.error("❌ Falha Crítica na inicialização:", error);
    process.exit(1);
  }
}

inicializarServidor();