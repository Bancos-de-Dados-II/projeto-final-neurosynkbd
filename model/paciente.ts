import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/sequelize.js';
import Usuario from './usuario.js';

interface PacienteAttributes {
    usuarioId: string;
    tipo_neurodivergencia: string;
    cuidado_especial?: string;
}

interface PacienteCreationAttributes extends Optional<PacienteAttributes, 'cuidado_especial'> {}

class Paciente extends Model<PacienteAttributes, PacienteCreationAttributes> implements PacienteAttributes {
    public usuarioId!: string;
    public tipo_neurodivergencia!: string;
    public cuidado_especial?: string;
}

Paciente.init({
    usuarioId: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
            model: Usuario,
            key: 'id'
        }
    },
    tipo_neurodivergencia: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cuidado_especial: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Paciente',
    tableName: 'Pacientes'
});

Paciente.belongsTo(Usuario, { foreignKey: 'usuarioId' });
Usuario.hasOne(Paciente, { foreignKey: 'usuarioId' });

export default Paciente;