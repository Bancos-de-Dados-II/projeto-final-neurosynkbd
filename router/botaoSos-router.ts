// router/botaoSos-router.ts
import { Router } from 'express';
import BotaoSosController from '../controller/botaoSos-controller.js';
import { authMiddleware, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const sosSchema = z.object({
    body: z.object({
        pacienteId: z.string().min(1, 'ID do paciente é obrigatório'),
        latitude: z.string().min(1, 'Latitude é obrigatória'),
        longitude: z.string().min(1, 'Longitude é obrigatória')
    })
});
router.use(authMiddleware);
router.post('/',
    authorize('Paciente', 'Cuidador'),
    validate(sosSchema),
    BotaoSosController.registrarSos
);
router.get('/historico/:pacienteId',
    authorize('Paciente', 'Cuidador', 'Terapeuta'),
    BotaoSosController.listarHistoricoPorPaciente
);

export default router;