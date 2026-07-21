import { Request, Response } from 'express';
import BotaoToTravado from '../model/BotaoToTravado.js';
import TarefaVisual from '../model/tarefa_Visual.js';

export async function registrarTravamento(req: Request, res: Response): Promise<void> {
    try {
        const { pacienteId, tarefaId } = req.body;
        
        const novoTravamento = await BotaoToTravado.create({
            pacienteId,
            tarefaId
        });
        
        res.status(201).json(novoTravamento);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

export async function obterHistoricoTravamentos(req: Request, res: Response): Promise<void> {
    try {
        const { pacienteId } = req.params;
        
        const historico = await BotaoToTravado.findAll({
            where: { pacienteId },
            include: [
                {
                    model: TarefaVisual,
                    as: 'tarefa',
                    attributes: ['tituloTarefa', 'descriçaoTarefa'] 
                }
            ],
            order: [['createdAt', 'DESC']] 
        });
        
        res.json(historico);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}