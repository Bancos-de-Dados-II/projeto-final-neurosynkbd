import { z } from 'zod';

export const createUsuarioSchema = z.object({
    nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    email: z
        .string()
        .min(1, 'E-mail é obrigatório')
        .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'E-mail inválido'),
    senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    tipo_usuario: z
        .string()
        .transform(val => {
            const normalized = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
            return normalized;
        })
        .pipe(z.enum(['Paciente', 'Cuidador', 'Terapeuta', 'Medico'])),
    latitude: z.string().optional(),
    longitude: z.string().optional()
});

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'E-mail é obrigatório')
        .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'E-mail inválido'),
    senha: z.string().min(1, 'Senha é obrigatória')
});

export const updateUsuarioSchema = createUsuarioSchema.partial();