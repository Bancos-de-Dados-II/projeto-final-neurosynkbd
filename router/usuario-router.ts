import { Router } from 'express';
import {
  criarUsuario,
  getUsuarios,
  getUsuarioById,
  atualizarUsuario,
  deletarUsuario,
  loginUsuario,
  buscarPacientePorId,
  vincularPaciente,
  getMeusPacientes,
  vincularPacienteAoMedico,
  getMeusPacientesMedico,
  atualizarStatusPaciente
} from '../controller/usuario-controller.js';
import { atualizarGeolocalizacao } from '../controller/localizacao-controller.js';
import { authMiddleware, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createUsuarioSchema, loginSchema, updateUsuarioSchema } from '../validators/usuarioValidator.js';

const router = Router();

router.post('/cadastro', validate(createUsuarioSchema), criarUsuario);
router.post('/login', validate(loginSchema), loginUsuario);
router.use(authMiddleware);

router.get('/meus-pacientes', authorize('Cuidador'), getMeusPacientes);

router.post('/vincular-paciente', authorize('Cuidador', 'Terapeuta'), vincularPaciente);

router.put('/localizacao', atualizarGeolocalizacao);

router.get('/paciente/:id', buscarPacientePorId);

router.get('/', authorize('Terapeuta', 'Medico'), getUsuarios);
router.get('/:id', getUsuarioById);
router.put('/:id', validate(updateUsuarioSchema), atualizarUsuario);
router.delete('/:id', authorize('Terapeuta', 'Medico'), deletarUsuario);
router.post(
  '/vincular-paciente-medico',
  authMiddleware,
  authorize('Terapeuta', 'Medico'),
  vincularPacienteAoMedico
);
router.get(
  '/meus-pacientes-medico',
  authMiddleware,
  authorize('Terapeuta', 'Medico'),
  getMeusPacientesMedico
);
router.put(
  '/:id/status',
  authMiddleware,
  authorize('Terapeuta', 'Medico'),
  atualizarStatusPaciente
);

export default router;