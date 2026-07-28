import { Schema, model, Document } from 'mongoose';

export interface IUsuario extends Document {
  nome: string;
  email: string;
  senha: string;
  tipo_usuario: 'Paciente' | 'Cuidador' | 'Terapeuta';
  // NOVOS CAMPOS ADICIONADOS NA INTERFACE:
  idade?: number;
  diagnosticoBase?: string;
  diagnostico?: string;
  cpf?: string;
  status?: string;
  pacientesVinculados?: Schema.Types.ObjectId[];
  localizacao?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

const UsuarioSchema = new Schema<IUsuario>({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  tipo_usuario: { type: String, required: true },

  // NOVOS CAMPOS ADICIONADOS NO SCHEMA:
  idade: { type: Number },
  diagnosticoBase: { type: String },
  diagnostico: { type: String },
  cpf: { type: String },
  status: { type: String, default: 'Ativo' },
  pacientesVinculados: [{
    type: Schema.Types.ObjectId,
    ref: 'Usuario'
  }],

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