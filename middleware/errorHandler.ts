import type { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('Erro:', err);

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            message: err.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }
    if (err.name === 'MulterError') {
        return res.status(400).json({ message: err.message });
    }

    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            message: 'Erro de validação',
            errors: (err as any).errors.map((e: any) => ({
                field: e.path,
                message: e.message
            }))
        });
    }

    return res.status(500).json({
        message: 'Erro interno no servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};