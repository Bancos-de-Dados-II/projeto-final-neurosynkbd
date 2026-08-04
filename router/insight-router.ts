import { Router } from 'express';
import InsightController from '../controller/insight-controller.js';
import { authMiddleware, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const createInsightSchema = z.object({
    body: z.object({
        dashboard: z.string().min(10, 'Dashboard deve ter pelo menos 10 caracteres'),
        periodo_semana: z.string().optional(),
        periodo_Mes: z.string().optional(),
        terapeutaId: z.string().min(1, 'ID do terapeuta é obrigatório'),
        pacienteId: z.string().min(1, 'ID do paciente é obrigatório')
    })
});

const updateInsightSchema = z.object({
    body: z.object({
        dashboard: z.string().min(10, 'Dashboard deve ter pelo menos 10 caracteres').optional(),
        periodo_semana: z.string().optional(),
        periodo_Mes: z.string().optional()
    }),
    params: z.object({
        id: z.string().uuid('ID do insight inválido')
    })
});

const getInsightByIdSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID do insight inválido')
    })
});

const getInsightsByPacienteSchema = z.object({
    params: z.object({
        pacienteId: z.string().uuid('ID do paciente inválido')
    })
});

const getInsightsByTerapeutaSchema = z.object({
    params: z.object({
        terapeutaId: z.string().uuid('ID do terapeuta inválido')
    })
});

const deleteInsightSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID do insight inválido')
    })
});

// ==================== ROTAS PÚBLICAS ====================
// (nenhuma rota pública para insights)

// ==================== ROTAS PROTEGIDAS ====================
router.use(authMiddleware); // Todas as rotas abaixo exigem autenticação

/**
 * @swagger
 * /insights:
 *   post:
 *     summary: Criar um novo insight
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dashboard
 *               - terapeutaId
 *               - pacienteId
 *             properties:
 *               dashboard:
 *                 type: string
 *                 description: Conteúdo do insight
 *               periodo_semana:
 *                 type: string
 *                 description: Período da semana (ex: "2024-W01")
 *               periodo_Mes:
 *                 type: string
 *                 description: Período do mês (ex: "2024-01")
 *               terapeutaId:
 *                 type: string
 *                 format: uuid
 *                 description: ID do terapeuta que gerou o insight
 *               pacienteId:
 *                 type: string
 *                 format: uuid
 *                 description: ID do paciente analisado
 *     responses:
 *       201:
 *         description: Insight criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Insight'
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       500:
 *         description: Erro interno
 */
router.post('/',
    authorize('Terapeuta'), // Apenas terapeutas podem criar insights
    validate(createInsightSchema),
    InsightController.criarInsight
);

/**
 * @swagger
 * /insights:
 *   get:
 *     summary: Listar todos os insights
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Quantidade por página
 *     responses:
 *       200:
 *         description: Lista de insights
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Insight'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/',
    authorize('Terapeuta', 'Cuidador'), // Terapeutas e cuidadores podem ver insights
    InsightController.listarTodosInsights
);

/**
 * @swagger
 * /insights/paciente/{pacienteId}:
 *   get:
 *     summary: Listar insights de um paciente específico
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pacienteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do paciente
 *     responses:
 *       200:
 *         description: Lista de insights do paciente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Insight'
 *                 total:
 *                   type: integer
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Paciente não encontrado
 */
router.get('/paciente/:pacienteId',
    authorize('Terapeuta', 'Cuidador', 'Paciente'), 
    validate(getInsightsByPacienteSchema),
    InsightController.listarInsightsPorPaciente
);

/**
 * @swagger
 * /insights/terapeuta/{terapeutaId}:
 *   get:
 *     summary: Listar insights gerados por um terapeuta
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: terapeutaId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do terapeuta
 *     responses:
 *       200:
 *         description: Lista de insights do terapeuta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Insight'
 *                 total:
 *                   type: integer
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Terapeuta não encontrado
 */
router.get('/terapeuta/:terapeutaId',
    authorize('Terapeuta'), // Apenas terapeutas podem ver insights de outros terapeutas
    validate(getInsightsByTerapeutaSchema),
    InsightController.listarInsightsPorTerapeuta
);

/**
 * @swagger
 * /insights/{id}:
 *   get:
 *     summary: Buscar um insight por ID
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do insight
 *     responses:
 *       200:
 *         description: Dados do insight
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Insight'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Insight não encontrado
 */
router.get('/:id',
    authorize('Terapeuta', 'Cuidador', 'Paciente'),
    validate(getInsightByIdSchema),
    InsightController.buscarInsightPorId
);

/**
 * @swagger
 * /insights/{id}:
 *   put:
 *     summary: Atualizar um insight existente
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do insight
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dashboard:
 *                 type: string
 *                 description: Conteúdo do insight
 *               periodo_semana:
 *                 type: string
 *                 description: Período da semana
 *               periodo_Mes:
 *                 type: string
 *                 description: Período do mês
 *     responses:
 *       200:
 *         description: Insight atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Insight'
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Insight não encontrado
 */
router.put('/:id',
    authorize('Terapeuta'), // Apenas terapeutas podem atualizar
    validate(updateInsightSchema),
    InsightController.atualizarInsight
);

/**
 * @swagger
 * /insights/{id}:
 *   delete:
 *     summary: Deletar um insight
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do insight
 *     responses:
 *       204:
 *         description: Insight deletado com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Insight não encontrado
 */
router.delete('/:id',
    authorize('Terapeuta'), // Apenas terapeutas podem deletar
    validate(deleteInsightSchema),
    InsightController.deletarInsight
);

/**
 * @swagger
 * /insights/paciente/{pacienteId}/stats:
 *   get:
 *     summary: Obter estatísticas de insights de um paciente
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pacienteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do paciente
 *     responses:
 *       200:
 *         description: Estatísticas de insights
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 porPeriodo:
 *                   type: object
 *                   properties:
 *                     semana:
 *                       type: integer
 *                     mes:
 *                       type: integer
 *                 ultimoInsight:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Não autenticado
 */
router.get('/paciente/:pacienteId/stats',
    authorize('Terapeuta', 'Cuidador'),
    validate(getInsightsByPacienteSchema),
    InsightController.obterEstatisticasInsights
);

/**
 * @swagger
 * /insights/resumo/recentes:
 *   get:
 *     summary: Obter insights recentes de todos os pacientes
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Quantidade de insights recentes
 *     responses:
 *       200:
 *         description: Lista de insights recentes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Insight'
 *       401:
 *         description: Não autenticado
 */
router.get('/resumo/recentes',
    authorize('Terapeuta', 'Cuidador'),
    InsightController.obterInsightsRecentes
);

export default router;