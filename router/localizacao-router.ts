import { Router } from 'express';
import { obterGeolocalizacao, atualizarGeolocalizacao, resolverGeolocalizacao } from '../controller/localizacao-controller.js';

const router = Router();

router.get('/', obterGeolocalizacao);
router.put('/', atualizarGeolocalizacao);
router.delete('/', resolverGeolocalizacao);

export default router;