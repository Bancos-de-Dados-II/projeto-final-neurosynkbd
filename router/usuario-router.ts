import { Router } from 'express';
import { 
    criarUsuario, 
    getUsuarios, 
    getUsuarioById, 
    atualizarUsuario, 
    deletarUsuario, 
    loginUsuario,
    buscarPacientePorId 
} from '../controller/usuario-controller.js';
import { atualizarGeolocalizacao } from '../controller/localizacao-controller.js';

const router = Router();

router.post('/cadastro', criarUsuario);         
router.get('/', getUsuarios);                   
router.get('/paciente/:id', buscarPacientePorId);
router.get('/:id', getUsuarioById);             
router.put('/:id', atualizarUsuario);           
router.delete('/:id', deletarUsuario);          
router.post('/login', loginUsuario);          
router.put('/localizacao', atualizarGeolocalizacao);

export default router;