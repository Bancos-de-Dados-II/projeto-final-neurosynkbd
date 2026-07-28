import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const postgresUri = process.env.POSTGRES_URI || '';

const sequelize = new Sequelize(postgresUri, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    family: 4 
  }
});

async function conectarBanco(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados Postgres (Neon) realizada com sucesso.');
  } catch (error: any) {
    console.error('Incapaz de conectar ao banco de dados:', error.message);
  }
}

conectarBanco();

export default sequelize;