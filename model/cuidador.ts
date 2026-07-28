import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from '../database/sequelize.js';

interface CuidadorAttributes {
    usuarioId: string;
}

interface CuidadorCreationAttributes extends Optional<CuidadorAttributes, 'usuarioId'> {}

class Cuidador extends Model<CuidadorAttributes, CuidadorCreationAttributes> implements CuidadorAttributes {
    public usuarioId!: string;
    
    public static associate(models: any) {
    }
}

Cuidador.init(
    {
        usuarioId: {
            type: DataTypes.STRING(24),
            primaryKey: true,
            allowNull: false,
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