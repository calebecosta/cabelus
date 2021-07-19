import * as Yup from 'yup';
import jwt from 'jsonwebtoken';

import Usuario from '../models/Usuario';
import Pescador from '../models/Pescador';
import GrupoSistema from '../models/GrupoSistema';
import FuncaoSistema from '../models/FuncaoSistema';
import authConfig from '../../config/auth';

class SessionController {
  async store(req, res) {
    // console.log('req >>', req.body);
    const schema = Yup.object().shape({
      cpf: Yup.string().required(() => {
        res.status(400).json({ error: `Preencha o campo "CPF"!` });
      }),
      senha: Yup.string().required(() => {
        res.status(400).json({ error: `Preencha o campo "Senha"!` });
      }),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha nas validações!' });
    }
    try {
      const { cpf, senha } = req.body;
      let usuario = null;
      let tipo_usuario = null;

      usuario = await Pescador.findOne({
        where: { cpf },
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'deleted_at'],
        },
      });
      tipo_usuario = 'pescador';
      if (!usuario) {
        usuario = await Usuario.findOne({
          where: { cpf },
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'deletedAt'],
          },
          include: [
            {
              model: GrupoSistema,
              as: 'grupo',
              attributes: {
                exclude: ['createdAt', 'updatedAt', 'deletedAt'],
              },
              include: [
                {
                  model: FuncaoSistema,
                  as: 'funcoes',
                  through: { attributes: [] }, // nao retornar dados da tabela pivot
                  attributes: {
                    exclude: [
                      'createdAt',
                      'updatedAt',
                      'deletedAt',
                      'funcaosistema_id',
                    ],
                  },
                },
              ],
            },
          ],
        });
        if (!usuario) {
          return res.status(400).json({ error: 'Usuário não encontrado!' });
        }
        tipo_usuario = 'adm';
      }

      if (!(await usuario.verificaSenha(senha))) {
        return res.status(400).json({ error: 'Senha incorreta!' });
      }
      usuario.senha_hash = null;
      return res.json({
        usuario,
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
      return res
        .status(500)
        .json({ error: 'Ops... estamos passando por uma instabilidade!' });
    }
  }
}

export default new SessionController();
