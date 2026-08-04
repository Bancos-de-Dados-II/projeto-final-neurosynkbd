import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UsuarioMongo } from '../model/usuarioMongo.js';

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: "Token não fornecido" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await UsuarioMongo.findById((decoded as any).id).select('-senha');
        
        if (!user) {
            return res.status(401).json({ message: "Usuário não encontrado" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token inválido ou expirado" });
    }
};

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: "Não autenticado" });
        }

        if (!roles.includes(req.user.tipo_usuario)) {
            return res.status(403).json({ 
                message: "Permissão negada. Requer: " + roles.join(', ') 
            });
        }

        next();
    };
};