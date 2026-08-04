import { Router } from 'express';
import { 
    cadastrarCuidador, 
    obterCuidadorPorUsuarioId ,
    alterarPermissao
} from '../controller/cuidador-controller.js';
import { authMiddleware, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.post('/', authorize('Cuidador', 'Terapeuta'), cadastrarCuidador);
router.get('/:usuarioId', authorize('Cuidador', 'Terapeuta', 'Paciente'), obterCuidadorPorUsuarioId);
router.put('/permissao', authorize('Cuidador'), alterarPermissao);

export default router;