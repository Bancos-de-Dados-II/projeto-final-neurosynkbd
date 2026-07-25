import { Router } from 'express';
import { 
    cadastrarTerapeuta, 
    obterTerapeutaPorUsuarioId 
} from '../controller/terapeuta-controller.js';

const router = Router();

router.post('/', cadastrarTerapeuta);
router.get('/:usuarioId', obterTerapeutaPorUsuarioId);

export default router;