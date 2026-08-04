import BotaoSos from '../model/BotaoSos.js';

export class BotaoSosService {
  async registrarSos(pacienteId: string, latitude: string, longitude: string) {
    const agora = new Date();
    const dataStr = String(agora.toISOString().split('T')[0]);
    const horaStr = String(agora.toTimeString().split(' ')[0]);

    return await BotaoSos.create({
      pacienteId,
      latitude: String(latitude),
      longitude: String(longitude),
      data: dataStr,
      hora: horaStr,
      pushEnviado: false
    });
  }

 async listarHistoricoPorPaciente(pacienteId: string) {
    console.log('Service - Buscando histórico para:', pacienteId);
    
    const historico = await BotaoSos.findAll({
      where: { 
        pacienteId: pacienteId
      },
      order: [
        ['data', 'DESC'], 
        ['hora', 'DESC']
      ],
      limit: 50 
    });
    
    console.log(`📊 Service - ${historico.length} registros encontrados`);
    return historico;
  }

  async buscarSosAtivo(pacienteId: string) {
    return await BotaoSos.findOne({ 
      where: { 
        pacienteId: pacienteId,
        pushEnviado: false
      } 
    });
  }
}

export default new BotaoSosService();