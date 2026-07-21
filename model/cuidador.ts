import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/sequelize.js';

interface CuidadorAttributes {
    usuarioId: string;
}

interface CuidadorCreationAttributes extends Optional<CuidadorAttributes, 'usuarioId'> {}

class Cuidador extends Model<CuidadorAttributes, CuidadorCreationAttributes> implements CuidadorAttributes {
    public usuarioId!: string;
    public static associate(models: any) {
        Cuidador.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
    }
}

Cuidador.init(
    {
        usuarioId: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            references: {
                model: 'Usuarios',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
    },
    {
        sequelize,
        modelName: 'Cuidador',
        tableName: 'Cuidadores',
        timestamps: false,
    }
);

export default Cuidador;