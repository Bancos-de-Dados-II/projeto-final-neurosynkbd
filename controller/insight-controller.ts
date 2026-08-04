import type { Request, Response, NextFunction } from 'express';
import insightService from '../service/insightService.js';

export class InsightController {
  
  async criarInsight(req: Request, res: Response, next: NextFunction) {
    try {
      const novoInsight = await insightService.criarInsight(req.body);
      return res.status(201).json({ 
        mensagem: "Insight criado com sucesso!", 
        dados: novoInsight 
      });
    } catch (error) {
      next(error);
    }
  }

  async listarTodosInsights(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { rows, count } = await insightService.listarTodosInsights(page, limit);

      return res.status(200).json({
        data: rows,
        total: count,
        page,
        limit
      });
    } catch (error) {
      next(error);
    }
  }

  async listarInsightsPorPaciente(req: Request, res: Response, next: NextFunction) {
    try {
      const { pacienteId } = req.params as { pacienteId: string };
      const insights = await insightService.listarInsightsPorPaciente(pacienteId);
      
      return res.status(200).json({
        data: insights,
        total: insights.length
      });
    } catch (error) {
      next(error);
    }
  }

  async listarInsightsPorTerapeuta(req: Request, res: Response, next: NextFunction) {
    try {
      const { terapeutaId } = req.params as { terapeutaId: string };
      const insights = await insightService.listarInsightsPorTerapeuta(terapeutaId);
      
      return res.status(200).json({
        data: insights,
        total: insights.length
      });
    } catch (error) {
      next(error);
    }
  }

  async buscarInsightPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const insight = await insightService.buscarInsightPorId(id);
      
      return res.status(200).json(insight);
    } catch (error) {
      next(error);
    }
  }

  async atualizarInsight(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const insightAtualizado = await insightService.atualizarInsight(id, req.body);
      
      return res.status(200).json({ 
        mensagem: "Insight atualizado com sucesso!", 
        dados: insightAtualizado 
      });
    } catch (error) {
      next(error);
    }
  }

  async deletarInsight(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      await insightService.deletarInsight(id);
      
      return res.status(204).send(); 
    } catch (error) {
      next(error);
    }
  }

  async obterEstatisticasInsights(req: Request, res: Response, next: NextFunction) {
    try {
      const { pacienteId } = req.params as { pacienteId: string };
      const estatisticas = await insightService.obterEstatisticasInsights(pacienteId);

      return res.status(200).json(estatisticas);
    } catch (error) {
      next(error);
    }
  }

  async obterInsightsRecentes(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const insights = await insightService.obterInsightsRecentes(limit);

      return res.status(200).json(insights);
    } catch (error) {
      next(error);
    }
  }
}

export default new InsightController();