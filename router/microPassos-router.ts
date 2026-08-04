import { Router } from 'express';
import { upload } from '../config/multer.js';
import MicroPassosController from '../controller/microPassos-controller.js';
import { authMiddleware, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const createMicroPassoSchema = z.object({
    body: z.object({
        descricaoPasso: z.string().min(1, 'Descrição é obrigatória'),
        ordemPasso: z.number().min(0, 'Ordem deve ser um número positivo'),
        idTarefa: z.string().min(1, 'ID da tarefa é obrigatório'),
        idCuidador: z.string().optional()
    })
});

router.use(authMiddleware);

router.post(
    '/',
    authorize('Cuidador', 'Terapeuta'),
    upload.single('imagem'),
    validate(createMicroPassoSchema),
    MicroPassosController.criarMicroPasso
);

router.get(
    '/tarefa/:tarefaId',
    authorize('Paciente', 'Cuidador', 'Terapeuta'),
    MicroPassosController.listarMicroPassosPorTarefa
);

router.put(
    '/:id',
    authorize('Cuidador', 'Terapeuta'),
    upload.single('imagem'),
    MicroPassosController.atualizarMicroPasso
);

router.patch(
    '/:id/toggle-concluido',
    authorize('Paciente', 'Cuidador', 'Terapeuta'),
    MicroPassosController.alternarConcluido
);

router.delete(
    '/:id',
    authorize('Cuidador', 'Terapeuta'),
    MicroPassosController.deletarMicroPasso
);

export default router;
