import type { Request, Response, NextFunction } from 'express';
import MicroPassos from '../model/micro_Passos.js';
import TarefaVisual from '../model/tarefa_Visual.js';
import { AppError } from '../middleware/errorHandler.js';

export class MicroPassosController {
    async criarMicroPasso(req: Request, res: Response, next: NextFunction) {
        try {
            const { descricaoPasso, ordemPasso, idTarefa, idCuidador } = req.body;
            const imagemPassos = req.file ? `/uploads/${req.file.filename}` : '';

            // Verifica se a tarefa existe
            const tarefa = await TarefaVisual.findByPk(idTarefa);
            if (!tarefa) {
                throw new AppError('Tarefa não encontrada', 404);
            }

            const microPasso = await MicroPassos.create({
                descricaoPasso,
                ordemPasso,
                imagemPassos,
                idTarefa,
                idCuidador,
                concluido: false
            });

            return res.status(201).json({
                mensagem: 'Micro passo criado com sucesso!',
                dados: microPasso
            });
        } catch (error) {
            next(error);
        }
    }

    async listarMicroPassosPorTarefa(req: Request, res: Response, next: NextFunction) {
        try {
            const { tarefaId } = req.params;
            const tarefaIdVal = Array.isArray(tarefaId) ? tarefaId[0] : tarefaId;
            
            const microPassos = await MicroPassos.findAll({
                where: { idTarefa: tarefaIdVal },
                order: [['ordemPasso', 'ASC']]
            });

            return res.status(200).json(microPassos);
        } catch (error) {
            next(error);
        }
    }

    async atualizarMicroPasso(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const idVal = Array.isArray(id) ? id[0] : id;
            const dados = req.body;
            
            if (!idVal) throw new AppError('ID do micro passo não fornecido', 400);
            const microPasso = await MicroPassos.findByPk(Number(idVal));
            if (!microPasso) {
                throw new AppError('Micro passo não encontrado', 404);
            }

            if (req.file) {
                dados.imagemPassos = `/uploads/${req.file.filename}`;
            }

            await microPasso.update(dados);
            return res.status(200).json({
                mensagem: 'Micro passo atualizado com sucesso!',
                dados: microPasso
            });
        } catch (error) {
            next(error);
        }
    }

    async alternarConcluido(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const idVal = Array.isArray(id) ? id[0] : id;
            if (!idVal) throw new AppError('ID do micro passo não fornecido', 400);
            const microPasso = await MicroPassos.findByPk(Number(idVal));
            if (!microPasso) {
                throw new AppError('Micro passo não encontrado', 404);
            }

            await microPasso.update({
                concluido: !microPasso.concluido
            });

            return res.status(200).json({
                mensagem: `Micro passo ${microPasso.concluido ? 'concluído' : 'pendente'}`,
                dados: microPasso
            });
        } catch (error) {
            next(error);
        }
    }

    async deletarMicroPasso(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const idVal = Array.isArray(id) ? id[0] : id;
            if (!idVal) throw new AppError('ID do micro passo não fornecido', 400);
            const microPasso = await MicroPassos.findByPk(Number(idVal));
            if (!microPasso) {
                throw new AppError('Micro passo não encontrado', 404);
            }

            await microPasso.destroy();
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

export default new MicroPassosController();