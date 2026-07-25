import { Router } from 'express';
import { 
    cadastrarPaciente, 
    obterPacientePorUsuarioId 
} from '../controller/paciente-controller.js';

const router = Router();

router.post('/', cadastrarPaciente);
router.get('/:usuarioId', obterPacientePorUsuarioId);

export default router;