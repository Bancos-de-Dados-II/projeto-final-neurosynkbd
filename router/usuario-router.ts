import { Router } from 'express';
import { 
    getUsuarios, 
    getUsuarioByEmail, 
    criarUsuario, 
    atualizarUsuario
} from '../controller/usuario-controller.js';

const UsuarioRouter: Router = Router();

UsuarioRouter.get('/', getUsuarios);
UsuarioRouter.get('/:email', getUsuarioByEmail);
UsuarioRouter.post('/', criarUsuario);
UsuarioRouter.put('/:id', atualizarUsuario);

export default UsuarioRouter;