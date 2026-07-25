import type { Request, Response } from 'express';
import { UsuarioMongo } from '../model/usuarioMongo.js';
import bcrypt from 'bcryptjs';

export const buscarPacientePorId = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const paciente = await UsuarioMongo.findById(id).select('-senha'); // Oculta a senha por segurança

        if (!paciente) {
            return res.status(404).json({ mensagem: 'Paciente não encontrado.' });
        }

        res.status(200).json(paciente);
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
        if (!usuario) {
            return res.status(401).json({ error: "E-mail ou senha incorretos." });
        }
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
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
    console.log(">>> ROTA DE VÍNCULO FOI CHAMADA! <<<", req.body);
  try {
    const { emailPaciente, idCuidador } = req.body;

    if (!emailPaciente || !idCuidador) {
      return res.status(400).json({ mensagem: 'E-mail do paciente e ID do cuidador são obrigatórios.' });
    }

    // 1. Procura se existe um usuário com esse e-mail E que seja 'Paciente'
    const paciente = await UsuarioMongo.findOne({
      email: emailPaciente.toLowerCase().trim(),
      tipo_usuario: 'Paciente'
    });

    if (!paciente) {
      return res.status(404).json({ mensagem: 'Paciente não encontrado com este e-mail.' });
    }

    // 2. Atualiza o cuidador adicionando o ID do paciente na lista dele
    await UsuarioMongo.findByIdAndUpdate(idCuidador, {
      $addToSet: { pacientesVinculados: paciente._id } // $addToSet evita duplicados
    });

    return res.status(200).json({
      mensagem: 'Paciente vinculado com sucesso!',
      paciente: { id: paciente._id, nome: paciente.nome, email: paciente.email }
    });

  } catch (error: any) {
    return res.status(500).json({ mensagem: 'Erro ao vincular paciente.', erro: error.message });
  }
};