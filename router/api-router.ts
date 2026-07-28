import { Router } from 'express';
import { upload } from '../config/multer.js';
import { 
    salvarRotinaECarta, 
    buscarPerfilPacienteComCuidador,
    registrarSosBanco,
    buscarSosAtivo,
    buscarRotinasDoPaciente
} from '../controller/paciente-rotina-controller.js';

const apiRouter = Router();
apiRouter.post('/pacientes/:pacienteId/rotina', upload.single('foto'), salvarRotinaECarta);
apiRouter.get('/pacientes/perfil/:id', buscarPerfilPacienteComCuidador);
apiRouter.post('/sos', registrarSosBanco);
apiRouter.get('/sos/ativo', buscarSosAtivo);
apiRouter.get('/pacientes/:pacienteId/rotinas', buscarRotinasDoPaciente);

export default apiRouter;