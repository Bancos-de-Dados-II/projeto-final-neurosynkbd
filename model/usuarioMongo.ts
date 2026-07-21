import { Schema, model, Document } from 'mongoose';

export interface IUsuario extends Document {
    nome: string;
    email: string;
    senha: string;
    tipo_usuario: 'Paciente' | 'Cuidador' | 'Terapeuta';
    localizacao: {
        type: 'Point';
        coordinates: [number, number]; 
    };
}
const UsuarioSchema = new Schema<IUsuario>({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true }, 
    tipo_usuario: { type: String, enum: ['Paciente', 'Cuidador', 'Terapeuta'], required: true },
    localizacao: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number], 
            required: true
        }
    }
});

UsuarioSchema.index({ localizacao: '2dsphere' });

export const UsuarioMongo = model<IUsuario>('Usuario', UsuarioSchema);