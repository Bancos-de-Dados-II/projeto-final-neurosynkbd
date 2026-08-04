import Terapeuta from '../model/terapeuta.js';
import { UsuarioMongo } from '../model/usuarioMongo.js';
import { AppError } from '../middleware/errorHandler.js';

export class TerapeutaService {
    async criarTerapeuta(usuarioId: string, crefito: string) {
        const usuario = await UsuarioMongo.findById(usuarioId);
        if (!usuario) {
            throw new AppError('Usuário não encontrado', 404);
        }

        const existente = await Terapeuta.findByPk(usuarioId);
        if (existente) {
            throw new AppError('Terapeuta já cadastrado', 400);
        }

        return await Terapeuta.create({ usuarioId, crefito });
    }

    async buscarPorId(usuarioId: string) {
        const terapeuta = await Terapeuta.findByPk(usuarioId);
        if (!terapeuta) {
            throw new AppError('Terapeuta não encontrado', 404);
        }
        return terapeuta;
    }

    async listarTodos() {
        return await Terapeuta.findAll();
    }

    async atualizar(usuarioId: string, dados: { crefito?: string }) {
        const terapeuta = await Terapeuta.findByPk(usuarioId);
        if (!terapeuta) {
            throw new AppError('Terapeuta não encontrado', 404);
        }
        return await terapeuta.update(dados);
    }

    async deletar(usuarioId: string) {
        const terapeuta = await Terapeuta.findByPk(usuarioId);
        if (!terapeuta) {
            throw new AppError('Terapeuta não encontrado', 404);
        }
        await terapeuta.destroy();
        return { message: 'Terapeuta removido com sucesso' };
    }
}

export default new TerapeutaService();