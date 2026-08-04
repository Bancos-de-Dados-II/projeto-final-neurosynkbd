// middleware/validate.ts
import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const validate = (schema: any) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!schema.shape?.body) {
                await schema.parseAsync(req.body);
            } else {
                await schema.parseAsync({
                    body: req.body,
                    query: req.query,
                    params: req.params,
                });
            }
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    message: "Erro de validação",
                    errors: error.issues.map(e => ({
                        path: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            return res.status(500).json({ message: "Erro interno no servidor" });
        }
    };
};