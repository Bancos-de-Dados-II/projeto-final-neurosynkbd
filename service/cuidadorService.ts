import Cuidador from '../model/cuidador.js';
import { UsuarioMongo } from '../model/usuarioMongo.js';
import { AppError } from '../middleware/errorHandler.js';

export class CuidadorService {
    async criarCuidador(usuarioId: string) {
        const usuario = await UsuarioMongo.findById(usuarioId);
        if (!usuario) {
            throw new AppError('Usuário não encontrado', 404);
        }

        const existente = await Cuidador.findByPk(usuarioId);
        if (existente) {
            throw new AppError('Cuidador já cadastrado', 400);
        }

        return await Cuidador.create({ usuarioId });
    }

    async buscarPorId(usuarioId: string) {
        const cuidador = await Cuidador.findByPk(usuarioId);
        if (!cuidador) {
            throw new AppError('Cuidador não encontrado', 404);
        }
        return cuidador;
    }

    async listarTodos() {
        return await Cuidador.findAll();
    }

    async deletar(usuarioId: string) {
        const cuidador = await Cuidador.findByPk(usuarioId);
        if (!cuidador) {
            throw new AppError('Cuidador não encontrado', 404);
        }
        await cuidador.destroy();
        return { message: 'Cuidador removido com sucesso' };
    }
}

export default new CuidadorService();