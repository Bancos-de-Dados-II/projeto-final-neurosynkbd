import { Router } from 'express';
import { 
    obterGeolocalizacao, 
    atualizarGeolocalizacao, 
    resolverGeolocalizacao 
} from '../controller/localizacao-controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', obterGeolocalizacao);
router.put('/', atualizarGeolocalizacao);
router.delete('/', resolverGeolocalizacao);

export default router;