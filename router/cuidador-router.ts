import { Router } from 'express';
import { 
    cadastrarCuidador, 
    obterCuidadorPorUsuarioId 
} from '../controller/cuidador-controller.js';

const router = Router();

router.post('/', cadastrarCuidador);
router.get('/:usuarioId', obterCuidadorPorUsuarioId);

export default router;