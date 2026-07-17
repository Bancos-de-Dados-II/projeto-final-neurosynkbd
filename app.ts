// app.ts
import express, { Application } from 'express';
import UsuarioRouter from './router/usuario-router.js';
import { conectarMongo } from './database/mongodb.ts';
import sequelize from './database/sequelize.js';

const app: Application = express();
const port: number = 3000;

app.use(express.json());

app.use('/usuarios', UsuarioRouter);
async function inicializarServidor() {
  try {
    await conectarMongo();
    await sequelize.sync({ force: false }); 
    console.log("Banco Postgres Sincronizado!");
    app.listen(port, () => {
      console.log(`NeuroSync API executando na porta ${port}`);
    });
  } catch (error) {
    console.error("Falha Crítica na inicialização do servidor ou conexões:", error);
    process.exit(1);
  }
}

inicializarServidor();
