import Paciente from '../model/paciente.js';
import { UsuarioMongo } from '../model/usuarioMongo.js';
import { AppError } from '../middleware/errorHandler.js';

export class PacienteService {
    async create(data: any) {
        const usuario = await UsuarioMongo.findById(data.usuarioId);
       if (!usuario) {
    throw new AppError('Usuário não encontrado', 404);
}
        
        return await Paciente.create(data);
    }

    async findById(id: string) {
        return await Paciente.findByPk(id);
    }

    async findAll() {
        return await Paciente.findAll();
    }

    async update(id: string, data: any) {
        const paciente = await Paciente.findByPk(id);
        if (!paciente) {
            throw new AppError('Paciente não encontrado', 404);
        }
        return await paciente.update(data);
    }

    async delete(id: string) {
        const paciente = await Paciente.findByPk(id);
        if (!paciente) {
            throw new Error('Paciente não encontrado');
        }
        await paciente.destroy();
        return { message: 'Paciente removido com sucesso' };
    }
}

export default new PacienteService();