import type { Request, Response } from 'express';
import Cuidador from '../model/cuidador.js';

export async function cadastrarCuidador(req: Request, res: Response) {
    try {
        const { usuarioId } = req.body;

        if (!usuarioId) {
            res.status(400).json({ error: "O ID do usuário é obrigatório." });
            return;
        }

        const cuidador = await Cuidador.create({
            usuarioId: String(usuarioId)
        });

        res.status(201).json({
            message: "Perfil de Cuidador cadastrado com sucesso!",
            cuidador
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
export async function obterCuidadorPorUsuarioId(req: Request, res: Response){
    try {
        const { usuarioId } = req.params;

        if (!usuarioId) {
            res.status(400).json({ error: "O parâmetro usuarioId é obrigatório." });
            return;
        }

        const cuidador = await Cuidador.findByPk(String(usuarioId));

        if (!cuidador) {
            res.status(404).json({ error: "Perfil de cuidador não encontrado." });
            return;
        }

        res.status(200).json(cuidador);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
export async function alterarPermissao(req: Request, res: Response) {
    try {
        const { cuidadorId, compartilhar } = req.body;
        
        console.log('🔑 Alterando permissão:', { cuidadorId, compartilhar });
        
        if (!cuidadorId) {
            return res.status(400).json({ error: "ID do cuidador é obrigatório." });
        }

        // Busca o cuidador no banco
        const cuidador = await Cuidador.findByPk(cuidadorId);
        
        if (!cuidador) {
            return res.status(404).json({ error: "Cuidador não encontrado." });
        }
        console.log(`✅ Permissão alterada: ${compartilhar ? 'ATIVADA' : 'DESATIVADA'}`);
        
        return res.status(200).json({ 
            message: `Compartilhamento ${compartilhar ? 'ativado' : 'desativado'} com sucesso!`,
            compartilhar,
            cuidadorId
        });
    } catch (error: any) {
        console.error('❌ Erro ao alterar permissão:', error);
        return res.status(500).json({ error: error.message });
    }
}