import Insight from '../model/Insight.js';
import Paciente from '../model/paciente.js';
import Terapeuta from '../model/terapeuta.js';
import { AppError } from '../middleware/errorHandler.js';

export class InsightService {
  async criarInsight(dados: { terapeutaId: string; pacienteId: string; dashboard: string; periodo_semana?: string; periodo_Mes?: string }) {
    const { terapeutaId, pacienteId, dashboard, periodo_semana, periodo_Mes } = dados;

    const paciente = await Paciente.findByPk(pacienteId);
    if (!paciente) throw new AppError('Paciente não encontrado', 404);

    const terapeuta = await Terapeuta.findByPk(terapeutaId);
    if (!terapeuta) throw new AppError('Terapeuta não encontrado', 404);

    const createData: any = {
      terapeutaId,
      pacienteId,
      dashboard
    };
    if (periodo_semana !== undefined) createData.periodo_semana = periodo_semana;
    if (periodo_Mes !== undefined) createData.periodo_Mes = periodo_Mes;

    return await Insight.create(createData);
  }

  async listarTodosInsights(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    const { count, rows } = await Insight.findAndCountAll({
      include: [
        { model: Paciente, as: 'pacienteAnalisado', attributes: ['usuarioId', 'tipo_neurodivergencia'] },
        { model: Terapeuta, as: 'terapeuta', attributes: ['usuarioId', 'crefito'] }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return { rows, count };
  }

  async listarInsightsPorPaciente(pacienteId: string) {
    const paciente = await Paciente.findByPk(pacienteId);
    if (!paciente) throw new AppError('Paciente não encontrado', 404);

    return await Insight.findAll({
      where: { pacienteId },
      include: [
        { model: Terapeuta, as: 'terapeuta', attributes: ['usuarioId', 'crefito'] }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  async listarInsightsPorTerapeuta(terapeutaId: string) {
    const terapeuta = await Terapeuta.findByPk(terapeutaId);
    if (!terapeuta) throw new AppError('Terapeuta não encontrado', 404);

    return await Insight.findAll({
      where: { terapeutaId },
      include: [
        { model: Paciente, as: 'pacienteAnalisado', attributes: ['usuarioId', 'tipo_neurodivergencia'] }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  async buscarInsightPorId(id: string) {
    const insight = await Insight.findByPk(id, {
      include: [
        { model: Paciente, as: 'pacienteAnalisado', attributes: ['usuarioId', 'tipo_neurodivergencia'] },
        { model: Terapeuta, as: 'terapeuta', attributes: ['usuarioId', 'crefito'] }
      ]
    });

    if (!insight) throw new AppError('Insight não encontrado', 404);
    return insight;
  }

  async atualizarInsight(id: string, dados: { dashboard?: string; periodo_semana?: string; periodo_Mes?: string }) {
    const insight = await Insight.findByPk(id);
    if (!insight) throw new AppError('Insight não encontrado', 404);

    const { dashboard, periodo_semana, periodo_Mes } = dados;

    const updateData: any = {};
    if (dashboard !== undefined) updateData.dashboard = dashboard;
    if (periodo_semana !== undefined) updateData.periodo_semana = periodo_semana;
    if (periodo_Mes !== undefined) updateData.periodo_Mes = periodo_Mes;

    return await insight.update(updateData);
  }

  async deletarInsight(id: string) {
    const insight = await Insight.findByPk(id);
    if (!insight) throw new AppError('Insight não encontrado', 404);
    await insight.destroy();
  }

  async obterEstatisticasInsights(pacienteId: string) {
    const insights = await Insight.findAll({
      where: { pacienteId },
      order: [['createdAt', 'DESC']]
    });

    const total = insights.length;
    const porPeriodo = {
      semana: insights.filter(i => i.periodo_semana).length,
      mes: insights.filter(i => i.periodo_Mes).length
    };

    const ultimoInsight = insights.length > 0
      ? (insights[0] as { createdAt?: Date | string | null }).createdAt ?? null
      : null;

    return { total, porPeriodo, ultimoInsight };
  }

  async obterInsightsRecentes(limit: number = 5) {
    return await Insight.findAll({
      include: [
        { model: Paciente, as: 'pacienteAnalisado', attributes: ['usuarioId', 'tipo_neurodivergencia'] },
        { model: Terapeuta, as: 'terapeuta', attributes: ['usuarioId', 'crefito'] }
      ],
      order: [['createdAt', 'DESC']],
      limit
    });
  }
}

export default new InsightService();