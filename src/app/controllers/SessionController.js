import * as Yup from 'yup';
import jwt from 'jsonwebtoken';

import Usuario from '../models/Usuario';
import Colaborador from '../models/Colaborador';
import Cliente from '../models/Cliente';
import GrupoSistema from '../models/GrupoSistema';
import FuncaoSistema from '../models/FuncaoSistema';
import authConfig from '../../config/auth';

class SessionController {
  async store(req, res) {
     //console.log('req >>', req.body);
    const schema = Yup.object().shape({
      email : Yup.string().required(() => {
        res.status(400).json({ error: `Preencha o campo "Email"!` });
      }),
      senha: Yup.string().required(() => {
        res.status(400).json({ error: `Preencha o campo "Senha"!` });
      }),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha nas validações!' });
    }
    try {
      const { email, senha } = req.body;
      let usuario = null;
      let tipo_usuario = null;

      usuario = await Usuario.findOne({
        where: { email },
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'deleted_at'],
        },
      });

      if(usuario){
        tipo_usuario = 'adm';
      }


      if (!usuario) {
        usuario = await Cliente.findOne({
          where: { email },
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'deletedAt'],
          },
        });
        
        tipo_usuario = 'cli';
      }

      if (!usuario) {
        usuario = await Colaborador.findOne({
          where: { email },
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'deletedAt'],
          },
        }); 
        tipo_usuario = 'col';
      }
      
      if (!usuario) {
        return res.status(400).json({ error: 'Usuário não encontrado!' });
      }
    

      if (!(await usuario.verificaSenha(senha))) {
        return res.status(400).json({ error: 'Senha incorreta!' });
      }
      usuario.senha_hash = null;

      return res.json({
        usuario,
        tipo:tipo_usuario,
        token: jwt.sign({ id: usuario.id, tipo_usuario }, authConfig.secret, {
          expiresIn: authConfig.expiresIn,
        }),
        /**
         * o primeiro parametro eh um objeto payload do jwt
         * o segundo parametro eh uma string unica entre todas as aplicacoes do mundo kk
         * o terceiro parametro sao algumas configuracoes para este token. todo token jwt
         * tem obrigatoriamente uma validade.
         */
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ error: 'Ops... estamos passando por uma instabilidade!' });
    }
  }
}

export default new SessionController();
