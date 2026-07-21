import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/sequelize.js';
import Terapeuta from './terapeuta.js';
import Paciente from './paciente.js';

interface InsightAttributes {
    idInsight: string;
    dashboard: string;
    periodo_semana?: string;
    periodo_Mes?: string;
    terapeutaId?: string;
    pacienteId?: string;
}

interface InsightCreationAttributes extends Optional<InsightAttributes, 'idInsight' | 'periodo_semana' | 'periodo_Mes'> {}

class Insight extends Model<InsightAttributes, InsightCreationAttributes> implements InsightAttributes {
    public idInsight!: string;
    public dashboard!: string;
    public periodo_semana?: string;
    public periodo_Mes?: string;
    public terapeutaId?: string;
    public pacienteId?: string;
}

Insight.init({
    idInsight: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    dashboard: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    periodo_semana: {
        type: DataTypes.STRING,
        allowNull: true
    },
    periodo_Mes: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Insight',
    tableName: 'Insights'
});

Terapeuta.hasMany(Insight, { foreignKey: 'terapeutaId', as: 'insightsGerados' });
Insight.belongsTo(Terapeuta, { foreignKey: 'terapeutaId', as: 'terapeuta' });

Paciente.hasMany(Insight, { foreignKey: 'pacienteId', as: 'historicoInsights' });
Insight.belongsTo(Paciente, { foreignKey: 'pacienteId', as: 'pacienteAnalisado' });

export default Insight;