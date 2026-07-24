import type { Request, Response } from 'express';
import Insight from '../model/Insight.js';

export class InsightController {
  async criarInsight(req: Request, res: Response) {
    try {
      const { terapeutaId, pacienteId, dashboard, periodo_semana, periodo_Mes } = req.body;
      const novoInsight = await Insight.create({
        terapeutaId, pacienteId, dashboard, periodo_semana, periodo_Mes
      });
      return res.status(201).json({ mensagem: "Insight criado com sucesso!", dados: novoInsight });
    } catch (error) {
      return res.status(500).json({ mensagem: "Erro ao criar insight", error });
    }
  }

  async listarInsightsPorPaciente(req: Request, res: Response) {
    try {
      const { pacienteId } = req.params;
      const insights = await Insight.findAll({ where: { pacienteId } });
      return res.status(200).json(insights);
    } catch (error) {
      return res.status(500).json({ mensagem: "Erro ao buscar insights", error });
    }
  }
}

export default new InsightController();