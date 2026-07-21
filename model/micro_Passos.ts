import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/sequelize.js';
import TarefaVisual from './tarefa_Visual.js';
import Cuidador from './cuidador.js';

interface MicroPassosAttributes {
    idMicroPassos: string;
    descricaoPasso: string;
    ordemPasso: number;
    imagemPassos?: string;
    concluido: boolean;
    idTarefa?: string;
    idCuidador?: string;
}

interface MicroPassosCreationAttributes extends Optional<MicroPassosAttributes, 'idMicroPassos' | 'imagemPassos' | 'concluido'> {}

class MicroPassos extends Model<MicroPassosAttributes, MicroPassosCreationAttributes> implements MicroPassosAttributes {
    public idMicroPassos!: string;
    public descricaoPasso!: string;
    public ordemPasso!: number;
    public imagemPassos?: string;
    public concluido!: boolean;
    public idTarefa?: string;
    public idCuidador?: string;
}

MicroPassos.init({
    idMicroPassos: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    descricaoPasso: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ordemPasso: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    imagemPassos: {
        type: DataTypes.STRING,
        allowNull: true
    },
    concluido: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: 'MicroPassos',
    tableName: 'Micro_Passos'
});

TarefaVisual.hasMany(MicroPassos, { foreignKey: 'idTarefa', as: 'microPassos' });
MicroPassos.belongsTo(TarefaVisual, { foreignKey: 'idTarefa' });

Cuidador.hasMany(MicroPassos, { foreignKey: 'idCuidador', as: 'cuidador' });
MicroPassos.belongsTo(Cuidador, { foreignKey: 'idCuidador', as: 'autor' });

export default MicroPassos;