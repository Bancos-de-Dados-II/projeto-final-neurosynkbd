import type { Request, Response } from 'express';
import Paciente from '../model/paciente.js';

export async function cadastrarPaciente(req: Request, res: Response) {
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

export async function obterPacientePorUsuarioId(req: Request, res: Response) {
    try {
        const usuarioIdParam = req.params.usuarioId;
        const usuarioId = Array.isArray(usuarioIdParam) ? usuarioIdParam[0] : usuarioIdParam;

        if (!usuarioId) {
            res.status(400).json({ error: "O parâmetro usuarioId é obrigatório." });
            return;
        }

        const paciente = await Paciente.findByPk(usuarioId);

        if (!paciente) {
            res.status(404).json({ error: "Perfil de paciente não encontrado." });
            return;
        }

        res.status(200).json(paciente);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
// paciente-controller.ts - Adicionar

export async function atualizarPaciente(req: Request, res: Response) {
    try {
        const usuarioIdParam = req.params.usuarioId;
        const usuarioId = Array.isArray(usuarioIdParam) ? usuarioIdParam[0] : usuarioIdParam;
        const { tipo_neurodivergencia, cuidado_especial } = req.body;

        if (!usuarioId) {
            res.status(400).json({ error: "O parâmetro usuarioId é obrigatório." });
            return;
        }

        const paciente = await Paciente.findByPk(usuarioId);
        if (!paciente) {
            res.status(404).json({ error: "Paciente não encontrado." });
            return;
        }

        await paciente.update({ tipo_neurodivergencia, cuidado_especial });
        res.status(200).json({ message: "Paciente atualizado!", paciente });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function deletarPaciente(req: Request, res: Response) {
    try {
        const usuarioIdParam = req.params.usuarioId;
        const usuarioId = Array.isArray(usuarioIdParam) ? usuarioIdParam[0] : usuarioIdParam;

        if (!usuarioId) {
            res.status(400).json({ error: "O parâmetro usuarioId é obrigatório." });
            return;
        }

        const paciente = await Paciente.findByPk(usuarioId);
        
        if (!paciente) {
            res.status(404).json({ error: "Paciente não encontrado." });
            return;
        }

        await paciente.destroy();
        res.status(200).json({ message: "Paciente removido com sucesso!" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}