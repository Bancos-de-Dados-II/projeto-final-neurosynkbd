import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from '../database/sequelize.js';

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

    public static associate(models: any) {
        if (models.BotaoSos) {
            Paciente.hasMany(models.BotaoSos, { foreignKey: 'pacienteId', as: 'alertasSos', constraints: false });
        }
    }
}

Paciente.init({
    usuarioId: {
        type: DataTypes.STRING(24),
        primaryKey: true,
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
    tableName: 'Pacientes',
    timestamps: false
});

export default Paciente;