import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from '../database/sequelize.js';

interface TarefaVisualAttributes {
  idTarefa: string;
  descriçaoTarefa: string;
  tituloTarefa: string;
  imagem_Url: string;
  statusTravado: boolean;
  idPaciente?: string | null;
  idCuidador?: string | null;
}

interface TarefaVisualCreationAttributes extends Optional<TarefaVisualAttributes, 'idTarefa' | 'statusTravado' | 'imagem_Url'> {}

class TarefaVisual extends Model<TarefaVisualAttributes, TarefaVisualCreationAttributes> implements TarefaVisualAttributes {
  public idTarefa!: string;
  public descriçaoTarefa!: string;
  public tituloTarefa!: string;
  public imagem_Url!: string;
  public statusTravado!: boolean;
  public idPaciente?: string | null;
  public idCuidador?: string | null;
}

TarefaVisual.init({
  idTarefa: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  descriçaoTarefa: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tituloTarefa: {
    type: DataTypes.STRING,
    allowNull: false
  },
  imagem_Url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  statusTravado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  idPaciente: {
    type: DataTypes.STRING(24),
    allowNull: true
  },
  idCuidador: {
    type: DataTypes.STRING(24),
    allowNull: true
  }
}, {
  sequelize,
  tableName: 'tarefa_Visual',  
    freezeTableName: true,
  timestamps: false
});

export default TarefaVisual;