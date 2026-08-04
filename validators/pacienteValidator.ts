import { z } from 'zod';

export const pacienteSchema = z.object({
    usuarioId: z.string().min(1, "ID do usuário é obrigatório"),
    tipo_neurodivergencia: z.string().min(1, "Tipo de neurodivergência é obrigatório"),
    cuidado_especial: z.string().optional()
});

export const updatePacienteSchema = pacienteSchema.partial();