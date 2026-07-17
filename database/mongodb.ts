import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function conectarMongo() {
    try {

        await mongoose.connect(process.env.MONGO_URI!);

        console.log("MongoDB conectado!");

    } catch (erro) {

        console.error(erro);
        process.exit(1);

    }
}