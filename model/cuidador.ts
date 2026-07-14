import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/sequelize.js';
import Usuario from './usuario.js';

interface CuidadorAttributes {
    usuarioId: string;
}

// Se usuarioId for gerado externamente (por exemplo, é PK vindo de Usuario), não precisamos torná-lo opcional;
// caso contrário, ajuste Optional<..., 'usuarioId'> conforme necessidade.
interface CuidadorCreationAttributes extends Optional<CuidadorAttributes, 'usuarioId'> {}

class Cuidador extends Model<CuidadorAttributes, CuidadorCreationAttributes> implements CuidadorAttributes {
    public usuarioId!: string;
}

Cuidador.init(
    {
        usuarioId: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            references: {
                // usar o nome da tabela/modelo como string evita problemas de import circular
                model: 'Usuarios',
                key: 'id',
            },
        },
    },
    {
        sequelize,
        modelName: 'Cuidador',
        tableName: 'Cuidadores',
        timestamps: false,
    }
);

Cuidador.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
Usuario.hasOne(Cuidador, { foreignKey: 'usuarioId', as: 'cuidador' });

export default Cuidador;