// router/api-router.ts
import { Router } from 'express';
import { upload } from '../config/multer.js';
import { 
    salvarRotinaECarta, 
    buscarPerfilPacienteComCuidador,
    buscarRotinasDoPaciente
} from '../controller/paciente-rotina-controller.js';


const apiRouter = Router();

apiRouter.post('/pacientes/:pacienteId/rotina', upload.single('foto'), salvarRotinaECarta);
apiRouter.get('/pacientes/perfil/:id', buscarPerfilPacienteComCuidador);
apiRouter.get('/pacientes/:pacienteId/rotinas', buscarRotinasDoPaciente);

export default apiRouter;