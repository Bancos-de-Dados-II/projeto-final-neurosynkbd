import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();
const dbName = process.env.PG_DATABASE as string;
const dbUser = process.env.PG_USER as string;
const dbPassword = process.env.PG_PASSWORD as string;
const dbHost = process.env.PG_HOST as string;

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: 'postgres',
  logging: false 
});

async function conectarBanco(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados Postgres realizada com sucesso.');
  } catch (error: any) {
    console.error('Incapaz de conectar ao banco de dados:', error.message);
  }
}

importantly: conectarBanco();

export default sequelize;