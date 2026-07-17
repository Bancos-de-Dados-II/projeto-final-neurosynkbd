import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/sequelize'; 
import Paciente from './paciente'; 

interface BotaoSosAttributes {
    id: string;
    latitude: string;
    longitude: string;
    data: string;
    hora: string;
    pushEnviado: boolean;
    pacienteId?: string;
}

interface BotaoSosCreationAttributes extends Optional<BotaoSosAttributes, 'id' | 'data' | 'hora' | 'pushEnviado'> {}

class BotaoSos extends Model<BotaoSosAttributes, BotaoSosCreationAttributes> implements BotaoSosAttributes {
    public id!: string;
    public latitude!: string;
    public longitude!: string;
    public data!: string;
    public hora!: string;
    public pushEnviado!: boolean;
    public pacienteId?: string;
}

BotaoSos.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    latitude: {
        type: DataTypes.STRING,
        allowNull: false
    },
    longitude: {
        type: DataTypes.STRING,
        allowNull: false
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
    },
    pushEnviado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    pacienteId: {
        type: DataTypes.UUID,
        allowNull: true
    }
}, {
    sequelize, 
    modelName: 'BotaoSos',
    tableName: 'Botoes_Sos'
});

// Relacionamentos
Paciente.hasMany(BotaoSos, { foreignKey: 'pacienteId', as: 'alertasSos' });
BotaoSos.belongsTo(Paciente, { foreignKey: 'pacienteId', as: 'paciente' });

export default BotaoSos;