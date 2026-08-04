import type { Request, Response, NextFunction } from 'express';
import botaoSosService from '../service/botaoSosService.js';

export class BotaoSosController {
  async registrarSos(req: Request, res: Response, next: NextFunction) {
    try {
      const { pacienteId, latitude, longitude } = req.body;
      
      if (!pacienteId || !latitude || !longitude) {
        return res.status(400).json({ 
          mensagem: "pacienteId, latitude e longitude são obrigatórios." 
        });
      }
      
      const novoSos = await botaoSosService.registrarSos(pacienteId, latitude, longitude);
      
      return res.status(201).json({ 
        mensagem: "Alerta SOS registrado com sucesso!", 
        dados: novoSos 
      });
    } catch (error) {
      next(error);
    }
  }

  async listarHistoricoPorPaciente(req: Request, res: Response, next: NextFunction) {
    try {
      const pacienteIdParam = req.params.pacienteId;
      const pacienteId = Array.isArray(pacienteIdParam) ? pacienteIdParam[0] : pacienteIdParam;
      
      console.log('📋 Buscando histórico SOS para paciente:', pacienteId);
      
      if (!pacienteId) {
        return res.status(400).json({ mensagem: 'ID do paciente é obrigatório.' });
      }
      
      const historico = await botaoSosService.listarHistoricoPorPaciente(pacienteId);
      
      console.log(`✅ ${historico.length} registros encontrados`);
      
      return res.status(200).json(historico);
    } catch (error) {
      console.error('❌ Erro ao buscar histórico SOS:', error);
      next(error);
    }
  }
}

export default new BotaoSosController();