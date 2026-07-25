import { Router } from 'express';
import { atualizarGeolocalizacao } from '../controller/localizacao-controller.js';

const router = Router();

router.put('/', atualizarGeolocalizacao);

export default router;