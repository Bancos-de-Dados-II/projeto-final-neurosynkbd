import type { Request, Response } from 'express';
import { UsuarioMongo } from '../model/usuarioMongo.js';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';

export const buscarPacientePorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // 1. Busca o paciente
    const paciente = await UsuarioMongo.findById(id).select('-senha');

    if (!paciente) {
      return res.status(404).json({ mensagem: 'Paciente não encontrado.' });
    }

    // 2. Busca no banco qual Cuidador tem o ID deste paciente no array pacientesVinculados
   // Substitua as linhas 18 a 20 por:
const cuidador = await UsuarioMongo.findOne({
  pacientesVinculados: id
} as any).select('nome email');

    // 3. Retorna os dados do paciente + os dados do cuidador encontrado
    res.status(200).json({
      ...paciente.toObject(),
      cuidador: cuidador ? { nome: cuidador.nome, email: cuidador.email } : null
    });
  } catch (error) {
    console.error('Erro ao buscar paciente:', error);
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

export async function criarUsuario(req: Request, res: Response): Promise<Response | void> {
  try {
    const { nome, email, senha, tipo_usuario, latitude, longitude } = req.body;
    if (!nome || !email || !senha || !tipo_usuario) {
      return res.status(400).json({ error: "Nome, e-mail, senha e tipo de usuário são obrigatórios." });
    }

    const usuarioExistente = await UsuarioMongo.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ error: "Este e-mail já está cadastrado." });
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
export async function getUsuarios(req: Request, res: Response): Promise<void> {
    try {
        const { tipo } = req.query;
        const filtro: any = {};

        if (tipo) {
            // Usa Regex com 'i' para encontrar 'Paciente', 'PACIENTE', 'paciente', etc.
            filtro.tipo_usuario = { $regex: new RegExp(`^${tipo}$`, 'i') };
        }

        const usuarios = await UsuarioMongo.find(filtro).select('-senha');
        res.json(usuarios);
    } catch (error: any) {
        console.error("Erro ao buscar usuários:", error);
        res.status(500).json({ error: error.message });
    }
}

export async function getUsuarioById(req: Request, res: Response): Promise<Response | void> {
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

export async function atualizarUsuario(req: Request, res: Response): Promise<Response | void> {
  try {
    const { id } = req.params;
    const { nome, idade, diagnosticoBase, diagnostico, cpf, status } = req.body;

    const dadosAtualizados: any = {};

    if (nome) dadosAtualizados.nome = nome;
    if (idade !== undefined && idade !== '') dadosAtualizados.idade = Number(idade);
    
    // Mapeia tanto diagnosticoBase quanto diagnostico
    const diagFinal = diagnosticoBase || diagnostico;
    if (diagFinal) {
      dadosAtualizados.diagnosticoBase = diagFinal;
      dadosAtualizados.diagnostico = diagFinal; // Salva nos dois para garantir
    }

    if (cpf) dadosAtualizados.cpf = cpf;
    if (status) dadosAtualizados.status = status;

    const usuarioAtualizado = await UsuarioMongo.findByIdAndUpdate(
      id,
      dadosAtualizados,
      { new: true }
    ).select('-senha');

    if (!usuarioAtualizado) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    return res.status(200).json({
      message: 'Usuário atualizado com sucesso!',
      usuario: usuarioAtualizado
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function deletarUsuario(req: Request, res: Response): Promise<Response | void> {
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

export async function loginUsuario(req: Request, res: Response): Promise<Response | void> {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
        }
        const usuario = await UsuarioMongo.findOne({ email });
        console.log("=== DIAGNÓSTICO DE LOGIN ===");
    console.log("E-mail recebido:", email);
    console.log("Usuário retornado do MongoDB:", usuario);
        if (!usuario) {
            return res.status(401).json({ error: "E-mail ou senha incorretos." });
        }
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        console.log("A senha é válida (bcrypt)?", senhaValida);
        if (!senhaValida) {
            return res.status(401).json({ error: "E-mail ou senha incorretos." });
        }

        const resposta: any = usuario.toObject();
        delete resposta.senha;

        // Padronização de chaves mantendo a formatação original do Mongoose ('Paciente', 'Cuidador', 'Terapeuta')
const role = resposta.tipo_usuario || resposta.tipo || '';

return res.status(200).json({
    message: "Login realizado com sucesso!",
    usuario: resposta,
    userRole: role,
    tipo_usuario: role,
    userName: resposta.nome
});
       

    } catch (error: any) {
        return res.status(500).json({ error: error.message });
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
export const checarSosAtivo = async (req: any, res: any) => {
  try {
    // Busca no MongoDB o usuário/paciente com o alerta de SOS ativo
    const usuarioSos = await UsuarioMongo.findOne({ 'sos.ativo': true });

    if (!usuarioSos) {
      return res.status(200).json({ ativo: false });
    }

    return res.status(200).json({
      ativo: true,
      usuarioId: usuarioSos._id,
      localizacao: usuarioSos.localizacao
    });
  } catch (error) {
    console.error("Erro ao checar status do SOS:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor." });
  }
};
