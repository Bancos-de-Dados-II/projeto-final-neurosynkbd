import { Router } from 'express';
import { 
    cadastrarPaciente, 
    obterPacientePorUsuarioId 
} from '../controller/paciente-controller.js';
import { authMiddleware, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.post('/', authorize('Paciente', 'Cuidador', 'Terapeuta'), cadastrarPaciente);
router.get('/:usuarioId', authorize('Paciente', 'Cuidador', 'Terapeuta'), obterPacientePorUsuarioId);

export default router;