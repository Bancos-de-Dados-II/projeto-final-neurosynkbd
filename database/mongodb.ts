import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function conectarMongo(): Promise<void> {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("A variável MONGO_URI não está definida no arquivo .env");
    }

    await mongoose.connect(mongoUri);
    console.log("🍃 MongoDB conectado com sucesso!");
  } catch (erro) {
    console.error("❌ Erro ao conectar ao MongoDB:", erro);
    process.exit(1);
  }
}