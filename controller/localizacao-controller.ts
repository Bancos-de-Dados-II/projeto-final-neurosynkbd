import type { Request, Response } from 'express';
import { UsuarioMongo } from '../model/usuarioMongo.js';

export const obterGeolocalizacao = async (req: Request, res: Response) => {
  try {
    const usuarioComLocalizacao = await UsuarioMongo.findOne({
      'localizacao.coordinates': { $exists: true }
    }).sort({ updatedAt: -1 });

    if (!usuarioComLocalizacao || !usuarioComLocalizacao.localizacao) {
      return res.status(404).json({ mensagem: 'Nenhuma localização registrada.' });
    }

    const [longitude, latitude] = usuarioComLocalizacao.localizacao.coordinates;

    return res.status(200).json({
      ativo: true,
      latitude,
      longitude,
      usuarioId: usuarioComLocalizacao._id
    });
  } catch (error) {
    console.error('Erro ao buscar localização:', error);
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
};

export async function atualizarGeolocalizacao(req: Request, res: Response): Promise<Response | void> {
    try {
        const { usuarioId, latitude, longitude } = req.body;
        if (!latitude || !longitude) {
            return res.status(400).json({ error: "Latitude e Longitude são obrigatórias." });
        }

        const usuarioAtualizado = await UsuarioMongo.findByIdAndUpdate(
            usuarioId,
            {
                localizacao: {
                    type: 'Point',
                    coordinates: [parseFloat(longitude), parseFloat(latitude)] // Longitude vem primeiro no GeoJSON!
                }
            },
            { new: true } 
        );

        if (!usuarioAtualizado) {
            return res.status(404).json({ error: "Usuário não encontrado no MongoDB." });
        }

        return res.status(200).json({
            message: "Localização GeoJSON salva com sucesso!",
            dados: usuarioAtualizado
        });

    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}

export const resolverGeolocalizacao = async (req: Request, res: Response) => {
  try {
    await UsuarioMongo.updateMany(
      { 'localizacao.coordinates': { $exists: true } },
      { $unset: { localizacao: "" } }
    );

    return res.status(200).json({ mensagem: 'SOS resolvido com sucesso!' });
  } catch (error) {
    console.error('Erro ao resolver SOS:', error);
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
};