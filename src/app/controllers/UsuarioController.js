import * as Yup from 'yup';
import Usuario from '../models/Usuario';
import GrupoSistema from '../models/GrupoSistema';
import FuncaoSistema from '../models/FuncaoSistema';

class UsuarioController {
  async index(req, res) {
    try {
      const usuario = await Usuario.findAll({
        attributes: ['id', 'cpf', 'nome', 'email'],
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
                attributes: {
                  exclude: ['createdAt', 'updatedAt', 'deletedAt'],
                },
              },
            ],
          },
        ],
      });
      return res.status(200).json(usuario);
    } catch (error) {
      return res
        .status(500)
        .json({ error: 'Ops... estamos passando por uma instabilidade!' });
    }
  }

  async show(req, res) {
    try {
      const usuario = await Usuario.findOne({
        where: { id: req.params.id },
        attributes: {
          exclude: [
            'createdAt',
            'updatedAt',
            'deleted_at',
            'senha_hash',
            'gruposistema_id',
          ],
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
      return res.status(200).json(usuario);
    } catch (error) {
      return res
        .status(500)
        .json({ error: 'Ops... estamos passando por uma instabilidade!' });
    }
  }

  async store(req, res) {
    // criacao de usuario
    const schema = Yup.object().shape({
      gruposistema_id: Yup.string().required(() =>
        res.status(400).json({ error: `Preencha o campo "Grupo"!` })
      ),
      nome: Yup.string().required(() =>
        res.status(400).json({ error: `Preencha o campo "Nome"!` })
      ),
      cpf: Yup.string().required(() =>
        res.status(400).json({ error: `Preencha o campo "Cpf"!` })
      ),
      email: Yup.string()
        .email()
        .required(() =>
          res.status(400).json({ error: `Preencha o campo "Email"!` })
        ),
      senha: Yup.string()
        .required(() =>
          res.status(400).json({ error: `Preencha o campo "Senha"!` })
        )
        .min(6, () =>
          res
            .status(400)
            .json({ error: `A senha deve possuir no minimo 6 caracteres.` })
        ),
    });

    /**
     * De a cordo com as regras a cima
     * validamos os dados com o yupi
     */
    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: 'Verifique os campos obrigatórios!' });
    }
    try {
      const usuarioExiste = await Usuario.findOne({
        where: { email: req.body.email },
      });
      // verifico se o usuario ja nao existe
      if (usuarioExiste) {
        return res.status(400).json({ error: 'Usuário já existente!' });
      }

      if (req.body.gruposistema_id) {
        const gruposistema = await GrupoSistema.findByPk(
          req.body.gruposistema_id
        );
        if (!gruposistema)
          return res
            .status(400)
            .json({ error: 'Grupo de sistema Inexistente!' });
      }

      const { id, nome, email } = await Usuario.create(req.body);

      return res.status(200).json({
        id,
        nome,
        email,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: 'Ops... estamos passando por uma instabilidade!' });
    }
  }

  async update(req, res) {
    // atualizacao de dados do usuario
    const schema = Yup.object().shape({
      nome: Yup.string(),
      email: Yup.string().email(),
      senhaAntiga: Yup.string().min(6),
      senha: Yup.string()
        .min(6)
        .when('senhaAntiga', (senhaAntiga, field) =>
          senhaAntiga
            ? field.required(() =>
                res.status(400).json({ error: 'Preencha o campo senha!' })
              )
            : field
        ),
      confirmaSenha: Yup.string().when('senha', (senha, field) =>
        senha
          ? field
              .required(() =>
                res.status(200).json({
                  error: 'Preencha o campo confirmando a nova senha!',
                })
              )
              .oneOf([Yup.ref('senha')])
          : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'As senhas não iguais!' });
    }
    try {
      if (req.tipo_usuario !== 'usuario')
        return res
          .status(200)
          .json({ error: 'Tipo de usuário não permitido!' });
      const { email, senhaAntiga } = req.body;
      let usuario = null;
      if (req.params.id) usuario = await Usuario.findByPk(req.params.id);
      // find by primary key
      else if (req.usuario_id) usuario = await Usuario.findByPk(req.usuario_id);
      // find by primary key
      else return res.status(400).json({ error: 'Informe o Usuário!' });

      if (email && email !== usuario.email) {
        const usuarioExiste = await Usuario.findOne({
          where: { email },
        });
        if (usuarioExiste) {
          return res.status(400).json({ error: 'Usuário já existente!' });
        }
      }

      if (senhaAntiga && !(await usuario.verificaSenha(senhaAntiga))) {
        return res.status(400).json({ error: 'Senha não corresponde!' });
      }

      if (req.body.gruposistema_id) {
        const gruposistema = await GrupoSistema.findByPk(
          req.body.gruposistema_id
        );
        if (!gruposistema)
          return res
            .status(200)
            .json({ error: 'Grupo de sistema Inexistente!' });
      }

      const { id } = await usuario.update(req.body);

      const usuarioReturn = await Usuario.findOne({
        where: { id },
        attributes: ['id', 'nome', 'email'],
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
      return res.status(200).json(usuarioReturn);
    } catch (error) {
      return res
        .status(500)
        .json({ error: 'Ops... estamos passando por uma instabilidade!' });
    }
  }

  async delete(req, res) {
    if (!req.params.id) {
      return res
        .status(500)
        .json({ error: 'Informe o usuário que deseja excluir!' });
    }
    try {
      await Usuario.destroy({
        where: { id: req.params.id },
      });
      return res.status(200).json({ success: `Usuário excluido com sucesso!` });
    } catch (error) {
      return res
        .status(500)
        .json({ error: `Ops... Não foi possível excluír o usuário.` });
    }
  }
}

export default new UsuarioController();
