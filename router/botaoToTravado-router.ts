import { Router } from 'express';
import { 
    registrarTravamento, 
    obterHistoricoTravamentos 
} from '../controller/botaoToTravado-controller.js';

const router = Router();

router.post('/', registrarTravamento);
router.get('/historico/:pacienteId', obterHistoricoTravamentos);

export default router;