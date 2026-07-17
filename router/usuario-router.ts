// router/usuario-router.ts
import { Router } from 'express';
import { 
    criarUsuario, 
    loginUsuario, 
    getUsuarios, 
    getUsuarioByEmail 
} from '../controller/usuario-controller.js';
import { atualizarGeolocalizacao } from '../controller/localizacao-controller.js';

const router = Router();
router.post('/cadastro', criarUsuario);
router.post('/login', loginUsuario);
router.get('/', getUsuarios);
router.get('/:email', getUsuarioByEmail);
router.put('/localizacao', atualizarGeolocalizacao);

export default router;