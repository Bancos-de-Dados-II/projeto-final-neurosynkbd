import { Router } from 'express';
import {
  criarUsuario,
  getUsuarios,
  getUsuarioById,
  atualizarUsuario,
  deletarUsuario,
  loginUsuario,
  buscarPacientePorId,
  vincularPaciente 
} from '../controller/usuario-controller.js';
import { atualizarGeolocalizacao } from '../controller/localizacao-controller.js';

const router = Router();

// 1. ROTAS ESPECÍFICAS PRIMEIRO (Antes do :id)
router.post('/cadastro', criarUsuario);
router.post('/login', loginUsuario);
router.post('/vincular-paciente', vincularPaciente); 
router.put('/localizacao', atualizarGeolocalizacao);
router.get('/paciente/:id', buscarPacientePorId);

// 2. ROTAS GENÉRICAS COM :id POR ÚLTIMO
router.get('/', getUsuarios);
router.get('/:id', getUsuarioById);
router.put('/:id', atualizarUsuario);
router.delete('/:id', deletarUsuario);

export default router;