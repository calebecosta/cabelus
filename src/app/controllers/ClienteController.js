import * as Yup from 'yup';
import Cliente from '../models/Cliente';
import GrupoSistema from '../models/GrupoSistema';
import FuncaoSistema from '../models/FuncaoSistema';

class ClienteController {
  async index(req, res) {
    try {
      const cliente = await Cliente.findAll({
        attributes: ['id', 'endereco','nome', 'email'],
      });
      return res.status(200).json(cliente);
    } catch (error) {
      return res
        .status(500)
        .json({ error: 'Ops... estamos passando por uma instabilidade!' });
    }
  }

  async show(req, res) {
    try {
      const cliente = await Cliente.findOne({
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

      });
      return res.status(200).json(cliente);
    } catch (error) {
      return res
        .status(500)
        .json({ error: 'Ops... estamos passando por uma instabilidade!' });
    }
  }

  async store(req, res) {
    // criacao de cliente
    const schema = Yup.object().shape({
      nome: Yup.string().required(() =>
        res.status(400).json({ error: `Preencha o campo "Nome"!` })
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

    const clienteExiste = await Cliente.findOne({
      where: { email: req.body.email },
    });
    
    // verifico se o cliente ja nao existe
    if (clienteExiste) {
      return res.status(400).json({ error: 'Cliente já existente!' });
    }


    try {
     
      const { id, nome, email } = await Cliente.create(req.body);

      return res.status(200).json({
        id,
        nome,
        email,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ error: 'Ops... estamos passando por uma instabilidade!' });
    }
  }

  async update(req, res) {
    // atualizacao de dados do cliente
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
      if (req.tipo_cliente !== 'cliente')
        return res
          .status(200)
          .json({ error: 'Tipo de usuário não permitido!' });
      const { email, senhaAntiga } = req.body;
      let cliente = null;
      if (req.params.id) cliente = await Cliente.findByPk(req.params.id);
      // find by primary key
      else if (req.cliente_id) cliente = await Cliente.findByPk(req.cliente_id);
      // find by primary key
      else return res.status(400).json({ error: 'Informe o Usuário!' });

      if (email && email !== cliente.email) {
        const clienteExiste = await Cliente.findOne({
          where: { email },
        });
        if (clienteExiste) {
          return res.status(400).json({ error: 'Usuário já existente!' });
        }
      }

      if (senhaAntiga && !(await cliente.verificaSenha(senhaAntiga))) {
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

      const { id } = await cliente.update(req.body);

      const clienteReturn = await Cliente.findOne({
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
      return res.status(200).json(clienteReturn);
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
        .json({ error: 'Informe o cliente que deseja excluir!' });
    }
    try {
      await Cliente.destroy({
        where: { id: req.params.id },
      });
      return res.status(200).json({ success: `Cliente excluido com sucesso!` });
    } catch (error) {
      return res
        .status(500)
        .json({ error: `Ops... Não foi possível excluír o cliente.` });
    }
  }
}

export default new ClienteController();
