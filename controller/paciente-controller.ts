import type { Request, Response } from 'express';
import Paciente from '../model/paciente.js';

export async function cadastrarPaciente(req: Request, res: Response): Promise<void> {
    try {
        const { usuarioId, tipo_neurodivergencia, cuidado_especial } = req.body;

        if (!usuarioId) {
            res.status(400).json({ error: "O ID do usuário MongoDB é obrigatório." });
            return;
        }

        const paciente = await Paciente.create({
            usuarioId,
            tipo_neurodivergencia,
            cuidado_especial
        });

        res.status(201).json({
            message: "Perfil de Paciente cadastrado com sucesso!",
            paciente
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function obterPacientePorUsuarioId(req: Request, res: Response): Promise<void> {
    try {
        const { usuarioId } = req.params;

        if (!usuarioId) {
            res.status(400).json({ error: "O parâmetro usuarioId é obrigatório." });
            return;
        }

        const paciente = await Paciente.findByPk(String(usuarioId));

        if (!paciente) {
            res.status(404).json({ error: "Perfil de paciente não encontrado." });
            return;
        }

        res.status(200).json(paciente);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}