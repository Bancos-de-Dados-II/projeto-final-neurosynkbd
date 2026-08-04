import { UsuarioMongo } from '../model/usuarioMongo.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/errorHandler.js';

export class UsuarioService {
  async criarUsuario(dados: any) {
    const { nome, email, senha, tipo_usuario, latitude, longitude } = dados;

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

    return resposta;
  }

  async login(email: string, senhaExplicita: string) {
    const usuario = await UsuarioMongo.findOne({ email });
    if (!usuario || !usuario.senha) {
      throw new AppError('E-mail ou senha incorretos.', 401);
    }

    const senhaValida = await bcrypt.compare(senhaExplicita, usuario.senha);
    if (!senhaValida) {
      throw new AppError('E-mail ou senha incorretos.', 401);
    }

    const token = jwt.sign(
      { id: usuario._id, email: usuario.email, tipo: usuario.tipo_usuario },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    const resposta: any = usuario.toObject();
    delete resposta.senha;

    return { token, usuario: resposta };
  }

  async buscarPorId(id: string) {
    const usuario = await UsuarioMongo.findById(id).select('-senha');
    if (!usuario) throw new AppError('Usuário não encontrado no MongoDB.', 404);
    return usuario;
  }

  async listarTodos(tipo?: string) {
    const filtro: any = {};
    if (tipo) {
      filtro.tipo_usuario = { $regex: new RegExp(`^${tipo}$`, 'i') };
    }
    return await UsuarioMongo.find(filtro).select('-senha');
  }

  async vincularPaciente(idCuidador: string, emailPaciente: string) {
    const paciente = await UsuarioMongo.findOne({ email: emailPaciente });
    if (!paciente) {
      throw new AppError('Paciente não encontrado com este e-mail.', 404);
    }

    await UsuarioMongo.findByIdAndUpdate(idCuidador, {
      $addToSet: { pacientesVinculados: paciente._id }
    });

    return { id: paciente._id, nome: paciente.nome, email: paciente.email };
  }
}

export default new UsuarioService();