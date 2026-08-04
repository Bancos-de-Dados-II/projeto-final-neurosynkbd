import { Router } from 'express';
import { upload } from '../config/multer.js';
import TarefaController from '../controller/tarefa-controller.js';
import { authMiddleware, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const createTarefaSchema = z.object({
    body: z.object({
        descriçaoTarefa: z.string().min(1, 'Descrição é obrigatória'),
        tituloTarefa: z.string().min(1, 'Título é obrigatório'),
        idPaciente: z.string().min(1, 'ID do paciente é obrigatório'),
        idCuidador: z.string().optional()
    })
});

router.use(authMiddleware);

router.post(
    '/',
    authorize('Cuidador', 'Terapeuta'),
    upload.single('imagem'),
    validate(createTarefaSchema),
    TarefaController.criarTarefa
);

router.get(
    '/paciente/:pacienteId',
    authorize('Paciente', 'Cuidador', 'Terapeuta'),
    TarefaController.listarTarefasPorPaciente
);

router.get(
    '/cuidador/:cuidadorId',
    authorize('Cuidador', 'Terapeuta'),
    TarefaController.listarTarefasPorCuidador
);

router.get(
    '/:id',
    authorize('Paciente', 'Cuidador', 'Terapeuta'),
    TarefaController.buscarTarefaPorId
);

router.put(
    '/:id',
    authorize('Cuidador', 'Terapeuta'),
    upload.single('imagem'),
    TarefaController.atualizarTarefa
);

router.patch(
    '/:id/toggle-travado',
    authorize('Cuidador', 'Terapeuta'),
    TarefaController.alternarStatusTravado
);

router.delete(
    '/:id',
    authorize('Cuidador', 'Terapeuta'),
    TarefaController.deletarTarefa
);

export default router;