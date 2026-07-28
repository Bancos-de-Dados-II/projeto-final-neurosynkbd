import type { Request, Response } from 'express';
import Terapeuta from '../model/terapeuta.js';

export async function cadastrarTerapeuta(req: Request, res: Response): Promise<void> {
    try {
        const { usuarioId, crefito } = req.body;

        if (!usuarioId || !crefito) {
            res.status(400).json({ error: "O ID do usuário e o CREFITO são obrigatórios." });
            return;
        }

        const terapeuta = await Terapeuta.create({
            usuarioId: String(usuarioId),
            crefito
        });

        res.status(201).json({
            message: "Perfil de Terapeuta cadastrado com sucesso!",
            terapeuta
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function obterTerapeutaPorUsuarioId(req: Request, res: Response): Promise<void> {
    try {
        const { usuarioId } = req.params;

        if (!usuarioId) {
            res.status(400).json({ error: "O parâmetro usuarioId é obrigatório." });
            return;
        }

        const terapeuta = await Terapeuta.findByPk(String(usuarioId));

        if (!terapeuta) {
            res.status(404).json({ error: "Perfil de terapeuta não encontrado." });
            return;
        }

        res.status(200).json(terapeuta);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}