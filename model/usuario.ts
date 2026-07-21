import { Schema, model, Document } from 'mongoose';
export interface IUsuario extends Document {
  nome: string;
  email: string;
  senha?: string;
  tipo_usuario: 'Paciente' | 'Cuidador' | 'Terapeuta';
  localizacao?: {
    type: string;
    coordinates: number[]; 
  };
  criadoEm: Date;
}

const UsuarioSchema = new Schema<IUsuario>(
  {
    nome: { 
      type: String, 
      required: [true, 'O nome é obrigatório.'], 
      trim: true 
    },
    email: { 
      type: String, 
      required: [true, 'O e-mail é obrigatório.'], 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    senha: { 
      type: String, 
      required: [true, 'A senha é obrigatória.'] 
    },
    tipo_usuario: { 
      type: String, 
      enum: ['Paciente', 'Cuidador', 'Terapeuta'], 
      default: 'Paciente' 
    },
    localizacao: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], 
        required: false
      }
    }
  },
  {
    timestamps: true 
  }
);

UsuarioSchema.index({ localizacao: '2dsphere' });

const Usuario = model<IUsuario>('Usuario', UsuarioSchema);

export default Usuario;