import { Router } from 'express';
import { 
    cadastrarTerapeuta, 
    obterTerapeutaPorUsuarioId 
} from '../controller/terapeuta-controller.js';
import { authMiddleware, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.post('/', authorize('Terapeuta'), cadastrarTerapeuta);
router.get('/:usuarioId', authorize('Terapeuta', 'Cuidador', 'Paciente'), obterTerapeutaPorUsuarioId);

export default router;