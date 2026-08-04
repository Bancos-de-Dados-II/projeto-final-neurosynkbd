// app.ts - Versão completa
import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

import express, { type Application } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';

import { conectarMongo } from './database/mongodb.js';
import { connectPostgres } from './database/postgres.js';
import sequelize from './database/sequelize.js';

// Routers
import UsuarioRouter from './router/usuario-router.js';
import CuidadorRouter from './router/cuidador-router.js';
import PacienteRouter from './router/paciente-router.js';
import TerapeutaRouter from './router/terapeuta-router.js';
import BotaoToTravadoRouter from './router/botaoToTravado-router.js';
import LocalizacaoRouter from './router/localizacao-router.js';
import apiRouter from './router/api-router.js';
import BotaoSosRouter from './router/botaoSos-router.js';
import InsightRouter from './router/insight-router.js';

// Middleware de erro
import { errorHandler } from './middleware/errorHandler.js';

// Swagger
import { swaggerSpec } from './config/swagger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Application = express();
const port: number = parseInt(process.env.PORT || '3000', 10);

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/usuarios', UsuarioRouter);
app.use('/cuidadores', CuidadorRouter);
app.use('/pacientes', PacienteRouter);
app.use('/terapeutas', TerapeutaRouter);
app.use('/botao-travado', BotaoToTravadoRouter);
app.use('/localizacao', LocalizacaoRouter);
app.use('/api', apiRouter);
app.use('/sos', BotaoSosRouter);
app.use('/insights', InsightRouter);


app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        services: {
            mongodb: 'connected',
            postgres: 'connected'
        }
    });
});
app.use(errorHandler);

async function conectarBancos() {
    try {
        await connectPostgres();
        console.log('🐘 PostgreSQL conectado com sucesso!');
    } catch (err) {
        console.error('⚠️ Erro ao conectar no PostgreSQL:', err);
    }

    try {
        await conectarMongo();
        console.log('🍃 MongoDB conectado com sucesso!');
    } catch (err) {
        console.error('⚠️ Erro ao conectar no MongoDB:', err);
    }

    try {
        await sequelize.sync({ alter: true });
        console.log('✅ Tabelas do PostgreSQL sincronizadas com sucesso!');
    } catch (err) {
        console.error('❌ Erro na sincronização das tabelas:', err);
    }
}

app.listen(port, () => {
    console.log(`🚀 NeuroSync rodando na porta ${port}: http://localhost:${port}`);
    console.log(`📚 Swagger: http://localhost:${port}/api-docs`);
    conectarBancos();
});

export default app;