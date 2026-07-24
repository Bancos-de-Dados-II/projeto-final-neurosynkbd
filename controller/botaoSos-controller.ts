import type { Request, Response } from 'express';
import BotaoSos from '../model/BotaoSos.js';

export class BotaoSosController {
  async registrarSos(req: Request, res: Response) {
    try {
      const { pacienteId, latitude, longitude } = req.body;
      const novoSos = await BotaoSos.create({ pacienteId, latitude, longitude });
      return res.status(201).json({ mensagem: "Alerta SOS registrado com sucesso!", dados: novoSos });
    } catch (error) {
      return res.status(500).json({ mensagem: "Erro ao registrar alerta SOS", error });
    }
  }

  async listarHistoricoPorPaciente(req: Request, res: Response) {
    try {
      const { pacienteId } = req.params;
      const historico = await BotaoSos.findAll({
        where: { pacienteId },
        order: [['data', 'DESC'], ['hora', 'DESC']]
      });
      return res.status(200).json(historico);
    } catch (error) {
      return res.status(500).json({ mensagem: "Erro ao buscar histórico de SOS", error });
    }
  }
}

export default new BotaoSosController();