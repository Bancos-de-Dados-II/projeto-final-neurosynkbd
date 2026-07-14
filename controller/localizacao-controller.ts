import { Request, Response } from 'express';
import { UsuarioMongo } from '../model/usuarioMongo.js';

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