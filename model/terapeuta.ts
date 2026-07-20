import { DataTypes, Model } from 'sequelize';
import sequelize from '../database/sequelize.js';

interface TerapeutaAttributes {
    usuarioId: string;
    crefito: string;
}

class Terapeuta extends Model<TerapeutaAttributes> implements TerapeutaAttributes {
    public usuarioId!: string;
    public crefito!: string;

    public static associate(models: any) {
        Terapeuta.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
    }
}

Terapeuta.init({
    usuarioId: {
        type: DataTypes.UUID,
        primaryKey: true,
    },
    crefito: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    sequelize,
    modelName: 'Terapeuta',
    tableName: 'Terapeutas',
    timestamps: false
});

export default Terapeuta;