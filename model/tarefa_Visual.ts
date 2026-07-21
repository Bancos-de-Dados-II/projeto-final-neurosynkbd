import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/sequelize.js';
import Paciente from './paciente.js';
import Cuidador from './cuidador.js';

interface TarefaVisualAttributes {
    idTarefa: string;
    descriçaoTarefa: string;
    tituloTarefa: string;
    imagem_Url: string;
    statusTravado: boolean;
    idPaciente?: string;
    idCuidador?: string;
}

interface TarefaVisualCreationAttributes extends Optional<TarefaVisualAttributes, 'idTarefa' | 'statusTravado'> {}

class TarefaVisual extends Model<TarefaVisualAttributes, TarefaVisualCreationAttributes> implements TarefaVisualAttributes {
    public idTarefa!: string;
    public descriçaoTarefa!: string;
    public tituloTarefa!: string;
    public imagem_Url!: string;
    public statusTravado!: boolean;
    public idPaciente?: string;
    public idCuidador?: string;
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
        allowNull: false
    },
    statusTravado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: 'TarefaVisual',
    tableName: 'Tarefas_Visuais'
});

Paciente.hasMany(TarefaVisual, { foreignKey: 'idPaciente', as: 'tarefas' });
TarefaVisual.belongsTo(Paciente, { foreignKey: 'idPaciente', as: 'paciente' });

Cuidador.hasMany(TarefaVisual, { foreignKey: 'idCuidador', as: 'tarefasCriadas' });
TarefaVisual.belongsTo(Cuidador, { foreignKey: 'idCuidador', as: 'criador' });

export default TarefaVisual;