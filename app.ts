import express, { Application } from 'express';
import UsuarioRouter from './router/usuario-router.js';

const app: Application = express();
const port: number = 3000;

app.use(express.json());

app.use('/usuarios', UsuarioRouter);

app.listen(port, () => {
  console.log(`NeuroSync API executando na porta ${port}`);
});