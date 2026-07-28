import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

import express, { type Application } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { conectarMongo } from './database/mongodb.js';
import { connectPostgres } from './database/postgres.js';
import sequelize from './database/sequelize.js';
import UsuarioRouter from './router/usuario-router.js';
import CuidadorRouter from './router/cuidador-router.js';
import PacienteRouter from './router/paciente-router.js';
import TerapeutaRouter from './router/terapeuta-router.js';
import BotaoToTravadoRouter from './router/botaoToTravado-router.js';
import LocalizacaoRouter from './router/localizacao-router.js'; // Corrigido a importação do router correto
import apiRouter from './router/api-router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Application = express();
const port: number = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

app.use('/usuarios', UsuarioRouter);
app.use('/cuidadores', CuidadorRouter);
app.use('/pacientes', PacienteRouter);
app.use('/terapeutas', TerapeutaRouter);
app.use('/botao-travado', BotaoToTravadoRouter);
app.use('/localizacao', LocalizacaoRouter);
app.use('/api', apiRouter);

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
  sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Tabelas do PostgreSQL sincronizadas com sucesso!');
  })
  .catch((err) => {
    console.error('❌ Erro ao sincronizar tabelas:', err);
  });
}

inicializarServidor();