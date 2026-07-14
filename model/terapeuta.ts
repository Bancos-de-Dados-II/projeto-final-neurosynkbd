import { DataTypes, Model } from 'sequelize';
import sequelize from '../database/sequelize.js';
import Usuario from './usuario.js';

interface TerapeutaAttributes {
    usuarioId: string;
    crefito: string;
}

class Terapeuta extends Model<TerapeutaAttributes> implements TerapeutaAttributes {
    public usuarioId!: string;
    public crefito!: string;
}

Terapeuta.init({
    usuarioId: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
            model: Usuario,
            key: 'id'
        }
    },
    crefito: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true
    }
}, {
    sequelize,
    modelName: 'Terapeuta',
    tableName: 'Terapeutas'
});

Terapeuta.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
Usuario.hasOne(Terapeuta, { foreignKey: 'usuarioId', as: 'terapeuta' });

export default Terapeuta;