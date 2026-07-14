import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/sequelize.js';
import Paciente from './paciente.js';
import Cuidador from './cuidador.js';
import Terapeuta from './terapeuta.js';

interface VinculoCuidadoAttributes {
    idVinculo: string;
    data_Inicio: string;
    nivel_Permissao: 'Rotina' | 'Localização' | 'Tudo'; // Tipagem estrita baseada no seu ENUM
    statusCompartilhamento?: boolean;
    pacienteId?: string;
    cuidadorId?: string;
    terapeutaId?: string;
}

interface VinculoCuidadoCreationAttributes extends Optional<VinculoCuidadoAttributes, 'idVinculo' | 'statusCompartilhamento'> {}

class VinculoCuidado extends Model<VinculoCuidadoAttributes, VinculoCuidadoCreationAttributes> implements VinculoCuidadoAttributes {
    public idVinculo!: string;
    public data_Inicio!: string;
    public nivel_Permissao!: 'Rotina' | 'Localização' | 'Tudo';
    public statusCompartilhamento?: boolean;
    public pacienteId?: string;
    public cuidadorId?: string;
    public terapeutaId?: string;
}

VinculoCuidado.init({
    idVinculo: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    data_Inicio: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    nivel_Permissao: {
        type: DataTypes.ENUM('Rotina', 'Localização', 'Tudo'),
        allowNull: false
    },
    statusCompartilhamento: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'VinculoCuidado',
    tableName: 'Vinculos_Cuidado'
});

VinculoCuidado.belongsTo(Paciente, { foreignKey: 'pacienteId', as: 'paciente' });
VinculoCuidado.belongsTo(Cuidador, { foreignKey: 'cuidadorId', as: 'cuidador' });
VinculoCuidado.belongsTo(Terapeuta, { foreignKey: 'terapeutaId', as: 'terapeuta' });

export default VinculoCuidado;