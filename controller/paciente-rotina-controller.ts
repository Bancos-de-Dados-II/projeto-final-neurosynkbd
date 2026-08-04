import type { Request, Response } from 'express';
import { UsuarioMongo } from '../model/usuarioMongo.js';
import TarefaVisual from '../model/tarefa_Visual.js';
import BotaoSos from '../model/BotaoSos.js';


// Helper para sanitizar os parâmetros de rota
function extrairIdDoParams(id: string | string[] | undefined): string | undefined {
    if (!id) return undefined;
    return Array.isArray(id) ? id[0] : id;
}

export async function salvarRotinaECarta(req: Request, res: Response) {
    try {
        const pacienteId = extrairIdDoParams(req.params.pacienteId);
        
        if (!pacienteId) {
            return res.status(400).json({ mensagem: 'ID do paciente é obrigatório.' });
        }

        const { titulo, proxima_medicacao, descricao } = req.body;
        
        let imagemUrl = '';
        if (req.file) {
            imagemUrl = `/uploads/${req.file.filename}`;
        }

        const novaTarefa = await TarefaVisual.create({
            idPaciente: pacienteId,
            tituloTarefa: titulo || 'Nova Tarefa',
            descriçaoTarefa: descricao || titulo || 'Sem descrição',
            imagem_Url: imagemUrl,
            statusTravado: false
        });

        if (proxima_medicacao) {
            await UsuarioMongo.findByIdAndUpdate(pacienteId, {
                proxima_medicacao: proxima_medicacao
            });
        }

        return res.status(200).json({
            mensagem: "Rotina e medicação atualizadas com sucesso no banco!",
            tarefa: novaTarefa
        });
    } catch (error: any) {
        console.error("Erro ao salvar rotina:", error);
        return res.status(500).json({ error: "Erro ao salvar rotina no servidor: " + error.message });
    }
}

export async function buscarPerfilPacienteComCuidador(req: Request, res: Response) {
    try {
        const id = extrairIdDoParams(req.params.id);

        if (!id) {
            return res.status(400).json({ mensagem: 'ID é obrigatório.' });
        }

        const paciente = await UsuarioMongo.findById(id).select('-senha');
        if (!paciente) {
            return res.status(404).json({ mensagem: 'Paciente não encontrado.' });
        }

        const cuidador = await UsuarioMongo.findOne({
            pacientesVinculados: id
        }).select('nome email');

        return res.status(200).json({
            paciente: paciente.toObject(),
            cuidador: cuidador ? { nome: cuidador.nome, email: cuidador.email } : null
        });
    } catch (error: any) {
        console.error("Erro ao buscar perfil:", error);
        return res.status(500).json({ error: "Erro ao buscar perfil: " + error.message });
    }
}
// 4. BUSCAR SOS ATIVO DO PACIENTE
export async function buscarSosAtivo(req: Request, res: Response) {
    try {
        const pacienteId = extrairIdDoParams(req.params.pacienteId);

        if (!pacienteId) {
            return res.status(400).json({ mensagem: 'ID do paciente é obrigatório.' });
        }

        const sosAtivo = await (BotaoSos as any).findOne({
            where: { pacienteId: pacienteId }
        });

        return res.status(200).json({ sosAtivo });
    } catch (error: any) {
        console.error("Erro ao buscar SOS ativo:", error);
        return res.status(500).json({ error: "Erro ao buscar SOS ativo: " + error.message });
    }
}

export async function buscarRotinasDoPaciente(req: Request, res: Response) {
    try {
        const pacienteId = extrairIdDoParams(req.params.pacienteId);

        if (!pacienteId) {
            return res.status(400).json({ mensagem: 'ID do paciente é obrigatório.' });
        }

        const tarefas = await TarefaVisual.findAll({
            where: { idPaciente: pacienteId }
        });

        return res.status(200).json(tarefas);
    } catch (error: any) {
        console.error("Erro ao buscar rotinas:", error);
        return res.status(500).json({ error: "Erro interno ao buscar rotinas: " + error.message });
    }
}