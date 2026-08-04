import type { Request, Response, NextFunction } from 'express';
import { UsuarioMongo } from '../model/usuarioMongo.js';
import { AppError } from '../middleware/errorHandler.js';

export const obterGeolocalizacao = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('📍 Buscando localização...');
    const cuidador = await UsuarioMongo.findById(req.user._id)
      .populate('pacientesVinculados');
    
    if (!cuidador) {
      return res.status(401).json({ mensagem: 'Usuário não autenticado.' });
    }
    if (!cuidador.pacientesVinculados || cuidador.pacientesVinculados.length === 0) {
      return res.status(404).json({ 
        mensagem: 'Nenhum paciente vinculado a este cuidador.' 
      });
    }
    const pacienteIds = cuidador.pacientesVinculados.map((p: any) => p._id);
    
    const pacienteComLocalizacao = await UsuarioMongo.findOne({
      _id: { $in: pacienteIds },
      'localizacao.coordinates': { $exists: true, $ne: [] }
    }).sort({ updatedAt: -1 });

    if (!pacienteComLocalizacao || !pacienteComLocalizacao.localizacao) {
      return res.status(404).json({ 
        mensagem: 'Nenhum paciente vinculado com localização ativa.' 
      });
    }

    const [longitude, latitude] = pacienteComLocalizacao.localizacao.coordinates;

    return res.status(200).json({
      ativo: true,
      latitude,
      longitude,
      usuarioId: pacienteComLocalizacao._id,
      nome: pacienteComLocalizacao.nome
    });
  } catch (error) {
    console.error('❌ Erro ao buscar localização:', error);
    next(error);
  }
};
export async function atualizarGeolocalizacao(req: Request, res: Response, next: NextFunction) {
    try {
        const { usuarioId, latitude, longitude } = req.body;
        
        console.log('📍 Atualizando localização:', { usuarioId, latitude, longitude });

        if (!usuarioId) {
            return res.status(400).json({ error: "usuarioId é obrigatório." });
        }

        if (!latitude || !longitude) {
            return res.status(400).json({ error: "Latitude e Longitude são obrigatórias." });
        }

        // Converte para números
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lng)) {
            return res.status(400).json({ error: "Latitude e Longitude devem ser números válidos." });
        }

        const usuarioAtualizado = await UsuarioMongo.findByIdAndUpdate(
            usuarioId,
            {
                localizacao: {
                    type: 'Point',
                    coordinates: [lng, lat] 
                }
            },
            { new: true } 
        );

        if (!usuarioAtualizado) {
            return res.status(404).json({ error: "Usuário não encontrado no MongoDB." });
        }

        console.log('✅ Localização atualizada para:', usuarioAtualizado.localizacao);

        return res.status(200).json({
            message: "Localização salva com sucesso!",
            dados: usuarioAtualizado
        });

    } catch (error: any) {
        console.error('Erro ao atualizar localização:', error);
        next(error);
    }
}

export const resolverGeolocalizacao = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('📍 Resolvendo SOS...');
    
    const result = await UsuarioMongo.updateMany(
      { 'localizacao.coordinates': { $exists: true } },
      { $unset: { localizacao: "" } }
    );

    console.log(`✅ SOS resolvido! ${result.modifiedCount} documentos atualizados.`);

    return res.status(200).json({ 
      mensagem: 'SOS resolvido com sucesso!',
      atualizados: result.modifiedCount
    });
  } catch (error) {
    console.error('Erro ao resolver SOS:', error);
    next(error);
  }
};