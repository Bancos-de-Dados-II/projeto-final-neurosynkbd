import type { Request, Response, NextFunction } from 'express';
import TarefaVisual from '../model/tarefa_Visual.js';
import MicroPassos from '../model/micro_Passos.js';
import { AppError } from '../middleware/errorHandler.js';

export class TarefaController {
    async criarTarefa(req: Request, res: Response, next: NextFunction) {
        try {
            const { descriçaoTarefa, tituloTarefa, idPaciente, idCuidador } = req.body;
            const imagem_Url = req.file ? `/uploads/${req.file.filename}` : '';

            const tarefa = await TarefaVisual.create({
                descriçaoTarefa,
                tituloTarefa,
                imagem_Url,
                idPaciente,
                idCuidador,
                statusTravado: false
            });

            return res.status(201).json({
                mensagem: 'Tarefa criada com sucesso!',
                dados: tarefa
            });
        } catch (error) {
            next(error);
        }
    }

    async listarTarefasPorPaciente(req: Request, res: Response, next: NextFunction) {
        try {
            const { pacienteId } = req.params;
            
            const tarefas = await TarefaVisual.findAll({
                where: { idPaciente: pacienteId },
                include: [{
                    model: MicroPassos,
                    as: 'microPassos',
                    order: [['ordemPasso', 'ASC']]
                }]
            });

            return res.status(200).json(tarefas);
        } catch (error) {
            next(error);
        }
    }

    async listarTarefasPorCuidador(req: Request, res: Response, next: NextFunction) {
        try {
            const { cuidadorId } = req.params;
            
            const tarefas = await TarefaVisual.findAll({
                where: { idCuidador: cuidadorId },
                include: [{
                    model: MicroPassos,
                    as: 'microPassos',
                    order: [['ordemPasso', 'ASC']]
                }]
            });

            return res.status(200).json(tarefas);
        } catch (error) {
            next(error);
        }
    }

    async buscarTarefaPorId(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            
            const tarefa = await TarefaVisual.findByPk(id as string, {
                include: [{
                    model: MicroPassos,
                    as: 'microPassos',
                    order: [['ordemPasso', 'ASC']]
                }]
            });

            if (!tarefa) {
                throw new AppError('Tarefa não encontrada', 404);
            }

            return res.status(200).json(tarefa);
        } catch (error) {
            next(error);
        }
    }

    async atualizarTarefa(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const dados = req.body;
            
            const tarefa = await TarefaVisual.findByPk(id);
            if (!tarefa) {
                throw new AppError('Tarefa não encontrada', 404);
            }

            if (req.file) {
                dados.imagem_Url = `/uploads/${req.file.filename}`;
            }

            await tarefa.update(dados);
            return res.status(200).json({
                mensagem: 'Tarefa atualizada com sucesso!',
                dados: tarefa
            });
        } catch (error) {
            next(error);
        }
    }

    async deletarTarefa(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            
            const tarefa = await TarefaVisual.findByPk(id);
            if (!tarefa) {
                throw new AppError('Tarefa não encontrada', 404);
            }
            await MicroPassos.destroy({ where: { idTarefa: id } });
            await tarefa.destroy();

            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async alternarStatusTravado(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            
            const tarefa = await TarefaVisual.findByPk(id);
            if (!tarefa) {
                throw new AppError('Tarefa não encontrada', 404);
            }

            await tarefa.update({
                statusTravado: !tarefa.statusTravado
            });

            return res.status(200).json({
                mensagem: `Tarefa ${tarefa.statusTravado ? 'travada' : 'destravada'} com sucesso!`,
                dados: tarefa
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new TarefaController();