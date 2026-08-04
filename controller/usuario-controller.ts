import mongoose from 'mongoose';
import type { Request, Response, NextFunction } from 'express';
import { UsuarioMongo } from '../model/usuarioMongo.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import usuarioService from '../service/usuarioService.js';

export const buscarPacientePorId = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string; 
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensagem: 'ID fornecido é inválido.' });
    }

    const paciente = await UsuarioMongo.findById(id).select('-senha');

    if (!paciente) {
      return res.status(404).json({ mensagem: 'Paciente não encontrado.' });
    }

    const cuidador = await UsuarioMongo.findOne({
      pacientesVinculados: id as any
    }).select('nome email');

    return res.status(200).json({
      ...paciente.toObject(),
      cuidador: cuidador ? { nome: cuidador.nome, email: cuidador.email } : null
    });
  } catch (error) {
    console.error('Erro ao buscar paciente:', error);
    return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

export async function criarUsuario(req: Request, res: Response) {
  try {
    console.log('📥 Body recebido:', req.body);
    console.log('📥 Headers:', req.headers);

    const { nome, email, senha, tipo_usuario, latitude, longitude } = req.body;
  
    if (!nome || !email || !senha || !tipo_usuario) {
      console.log('❌ Campos faltando:', { nome, email, senha, tipo_usuario });
      return res.status(400).json({ 
        error: "Nome, e-mail, senha e tipo de usuário são obrigatórios.",
        recebido: req.body 
      });
    }

    const latFinal = latitude ? parseFloat(latitude) : -15.7801;
    const lngFinal = longitude ? parseFloat(longitude) : -47.9292;
    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senha, salt);

    const novoUsuario = await UsuarioMongo.create({
      nome,
      email,
      senha: senhaCriptografada,
      tipo_usuario: tipo_usuario.charAt(0).toUpperCase() + tipo_usuario.slice(1).toLowerCase(),
      localizacao: {
        type: 'Point',
        coordinates: [lngFinal, latFinal]
      }
    });

    const resposta: any = novoUsuario.toObject();
    delete resposta.senha;

    resposta.userRole = resposta.tipo_usuario;
    resposta.userName = resposta.nome;
    resposta.tipo = resposta.tipo_usuario;

    return res.status(201).json({
      message: "Usuário cadastrado com sucesso!",
      usuario: resposta,
      userRole: resposta.userRole,
      userName: resposta.userName
    });

  } catch (error: any) {
    console.error("Erro ao criar usuário no MongoDB:", error);
    return res.status(500).json({ error: error.message });
  }
}
export async function getUsuarios(req: Request, res: Response){
    try {
        const { tipo } = req.query;
        const filtro: any = {};

        if (tipo) {
            filtro.tipo_usuario = { $regex: new RegExp(`^${tipo}$`, 'i') };
        }

        const usuarios = await UsuarioMongo.find(filtro).select('-senha');
        res.json(usuarios);
    } catch (error: any) {
        console.error("Erro ao buscar usuários:", error);
        res.status(500).json({ error: error.message });
    }
}

export async function getUsuarioById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const usuario = await UsuarioMongo.findById(id).select('-senha');
        
        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado no MongoDB.' });
        }
        return res.json(usuario);
    } catch (error: any) {
        return res.status(500).json({ error: "ID inválido ou erro no servidor: " + error.message });
    }
}

export async function atualizarUsuario(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { nome, tipo_usuario, senha } = req.body;
        const dadosAtualizados: any = {};
        if (nome) dadosAtualizados.nome = nome;
        if (tipo_usuario) dadosAtualizados.tipo_usuario = tipo_usuario;
        if (senha) {
            const salt = await bcrypt.genSalt(10);
            dadosAtualizados.senha = await bcrypt.hash(senha, salt);
        }

        const usuarioAtualizado = await UsuarioMongo.findByIdAndUpdate(
            id,
            dadosAtualizados,
            { new: true } 
        ).select('-senha');

        if (!usuarioAtualizado) {
            return res.status(404).json({ error: 'Usuário não encontrado para atualização.' });
        }

        return res.status(200).json({
            message: 'Usuário atualizado com sucesso!',
            usuario: usuarioAtualizado
        });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}

export async function deletarUsuario(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const usuarioDeletado = await UsuarioMongo.findByIdAndDelete(id);

        if (!usuarioDeletado) {
            return res.status(404).json({ error: 'Usuário não encontrado para deleção.' });
        }

        return res.status(200).json({
            message: 'Usuário removido com sucesso do MongoDB!'
        });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}

export async function loginUsuario(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, senha } = req.body;
        const resultado = await usuarioService.login(email, senha);

        return res.status(200).json({
            message: "Login realizado com sucesso!",
            ...resultado
        });
    } catch (error) {
        next(error); 
    }
}
export const vincularPaciente = async (req: Request, res: Response) => {
  try {
    const { idCuidador, emailPaciente } = req.body;
    console.log("--> Dados recebidos no body:", req.body);

    // 1. Busca o paciente pelo e-mail
    const paciente = await UsuarioMongo.findOne({ email: emailPaciente });
    console.log("--> Paciente encontrado:", paciente);

    if (!paciente) {
      return res.status(404).json({ mensagem: 'Paciente não encontrado com este e-mail.' });
    }

    // 2. Atualiza o cuidador
    const resultado = await UsuarioMongo.findByIdAndUpdate(idCuidador, {
      $addToSet: { pacientesVinculados: paciente._id }
    }, { new: true });
    
    console.log("--> Cuidador apos update:", resultado);

    return res.status(200).json({
      mensagem: 'Paciente vinculado com sucesso!',
      paciente: { id: paciente._id, nome: paciente.nome, email: paciente.email }
    });

  } catch (error: any) {
    console.error("--> Erro no catch:", error);
    return res.status(500).json({ mensagem: 'Erro ao vincular paciente.', erro: error.message });
  }
};
export const getMeusPacientes = async (req: Request, res: Response) => {
    try {
        const cuidadorId = req.user._id; 
        
        console.log('🔍 Buscando pacientes do cuidador:', cuidadorId);
        const cuidador = await UsuarioMongo.findById(cuidadorId)
            .populate('pacientesVinculados')
            .select('pacientesVinculados');
        
        if (!cuidador) {
            return res.status(404).json({ mensagem: 'Cuidador não encontrado.' });
        }

        const pacientes = cuidador.pacientesVinculados || [];
        console.log(`✅ ${pacientes.length} pacientes encontrados`);

        return res.status(200).json(pacientes);
    } catch (error) {
        console.error('Erro ao buscar pacientes do cuidador:', error);
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

export const vincularPacienteAoMedico = async (req: Request, res: Response) => {
  try {
    const { idMedico, emailPaciente } = req.body;
    
    console.log('📤 Vinculando paciente ao médico:', { idMedico, emailPaciente });

    if (!idMedico || !emailPaciente) {
      return res.status(400).json({ 
        mensagem: 'ID do médico e e-mail do paciente são obrigatórios.' 
      });
    }
    const medico = await UsuarioMongo.findById(idMedico);
    if (!medico) {
      return res.status(404).json({ mensagem: 'Médico/Terapeuta não encontrado.' });
    }

    const tipoMedico = medico.tipo_usuario?.toLowerCase();
    if (tipoMedico !== 'medico' && tipoMedico !== 'terapeuta') {
      return res.status(400).json({ 
        mensagem: 'O usuário não é um médico ou terapeuta.' 
      });
    }

    const paciente = await UsuarioMongo.findOne({ email: emailPaciente });
    if (!paciente) {
      return res.status(404).json({ mensagem: 'Paciente não encontrado com este e-mail.' });
    }

    // Verifica se o usuário é paciente
    if ((paciente.tipo_usuario || '').toLowerCase() !== 'paciente') {
      return res.status(400).json({ 
        mensagem: 'O usuário com este e-mail não é um paciente.' 
      });
    }
    if (medico.pacientesVinculados?.includes(paciente._id as any)) {
      return res.status(400).json({ 
        mensagem: 'Este paciente já está vinculado a este médico.' 
      });
    }
    const medicoAtualizado = await UsuarioMongo.findByIdAndUpdate(
      idMedico,
      {
        $addToSet: { pacientesVinculados: paciente._id }
      },
      { new: true }
    ).populate('pacientesVinculados');

    return res.status(200).json({
      mensagem: 'Paciente vinculado ao médico com sucesso!',
      medico: {
        id: medicoAtualizado?._id,
        nome: medicoAtualizado?.nome,
        pacientes: medicoAtualizado?.pacientesVinculados || []
      },
      paciente: { 
        id: paciente._id, 
        nome: paciente.nome, 
        email: paciente.email 
      }
    });

  } catch (error: any) {
    console.error('❌ Erro ao vincular paciente ao médico:', error);
    return res.status(500).json({ 
      mensagem: 'Erro ao vincular paciente.', 
      erro: error.message 
    });
  }
};

export const getMeusPacientesMedico = async (req: Request, res: Response) => {
  try {
    const medicoId = req.user._id;
    
    console.log(' Buscando pacientes do médico:', medicoId);
    
    const medico = await UsuarioMongo.findById(medicoId)
      .populate('pacientesVinculados')
      .select('pacientesVinculados nome');
    
    if (!medico) {
      return res.status(404).json({ mensagem: 'Médico não encontrado.' });
    }

    const pacientes = medico.pacientesVinculados || [];
    console.log(`✅ ${pacientes.length} pacientes vinculados ao médico`);

    return res.status(200).json({
      medico: {
        id: medico._id,
        nome: medico.nome
      },
      pacientes: pacientes
    });
  } catch (error: any) {
    console.error('❌ Erro ao buscar pacientes do médico:', error);
    return res.status(500).json({ 
      mensagem: 'Erro ao buscar pacientes.', 
      erro: error.message 
    });
  }
};
export const atualizarStatusPaciente = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const statusValidos = ['Ativo', 'Em observação', 'Internado', 'Alta'];
    
    if (!status) {
      return res.status(400).json({ 
        mensagem: 'Status é obrigatório.' 
      });
    }

    if (!statusValidos.includes(status)) {
      return res.status(400).json({ 
        mensagem: 'Status inválido. Use: ' + statusValidos.join(', ') 
      });
    }

    const paciente = await UsuarioMongo.findById(id);
    if (!paciente) {
      return res.status(404).json({ mensagem: 'Paciente não encontrado.' });
    }
    if ((paciente.tipo_usuario || '').toLowerCase() !== 'paciente') {
      return res.status(400).json({ 
        mensagem: 'O usuário não é um paciente.' 
      });
    }
    paciente.status = status;
    await paciente.save();

    console.log(`✅ Status do paciente ${paciente.nome} atualizado para: ${status}`);

    return res.status(200).json({
      mensagem: 'Status do paciente atualizado com sucesso!',
      paciente: {
        id: paciente._id,
        nome: paciente.nome,
        email: paciente.email,
        status: paciente.status
      }
    });
  } catch (error: any) {
    console.error('❌ Erro ao atualizar status:', error);
    return res.status(500).json({ 
      mensagem: 'Erro ao atualizar status.', 
      erro: error.message 
    });
  }
};