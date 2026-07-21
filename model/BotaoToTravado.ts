import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/sequelize.js';
import Paciente from './paciente.js';
import TarefaVisual from './tarefa_Visual.js';

interface BotaoToTravadoAttributes {
    id: string;
    data: string;
    hora: string;
    pacienteId?: string;
    tarefaId?: string;
}

interface BotaoToTravadoCreationAttributes extends Optional<BotaoToTravadoAttributes, 'id' | 'data' | 'hora'> {}

class BotaoToTravado extends Model<BotaoToTravadoAttributes, BotaoToTravadoCreationAttributes> implements BotaoToTravadoAttributes {
    public id!: string;
    public data!: string;
    public hora!: string;
    public pacienteId?: string;
    public tarefaId?: string;
}

BotaoToTravado.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    data: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    hora: {
        type: DataTypes.TIME,
        defaultValue: DataTypes.NOW,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'BotaoToTravado',
    tableName: 'Botoes_ToTravado'
});

Paciente.hasMany(BotaoToTravado, { foreignKey: 'pacienteId', as: 'travamentos' });
BotaoToTravado.belongsTo(Paciente, { foreignKey: 'pacienteId', as: 'paciente' });

TarefaVisual.hasMany(BotaoToTravado, { foreignKey: 'tarefaId', as: 'logsDeTravamento' });
BotaoToTravado.belongsTo(TarefaVisual, { foreignKey: 'tarefaId', as: 'tarefa' });

export default BotaoToTravado;