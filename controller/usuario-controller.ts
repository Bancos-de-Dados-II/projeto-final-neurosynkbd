import { Request, Response } from 'express';
import Usuario from '../model/usuario.js';

export async function getUsuarios(req: Request, res: Response): Promise<void> {
    try {
        const usuarios = await Usuario.findAll();
        res.json(usuarios);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

export async function getUsuarioByEmail(req: Request, res: Response): Promise<Response | void> {
    try {
        const { email } = req.params;
        const usuario = await Usuario.findOne({ where: { email } });
        
        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json(usuario);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

export async function criarUsuario(req: Request, res: Response): Promise<void> {
    try {
        const usuario = await Usuario.create(req.body);
        res.status(201).json(usuario);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

export async function atualizarUsuario(req: Request, res: Response): Promise<Response | void> {
    try {
        const { email } = req.params;
        const usuario = await Usuario.findOne({ where: { email } });
        
        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        await usuario.update(req.body); 
        res.json(usuario);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}