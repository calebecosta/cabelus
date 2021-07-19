import * as Yup from 'yup';
import GrupoSistema from '../models/GrupoSistema';
import FuncaoSistema from '../models/FuncaoSistema';

class GrupoSistemaController {
  async index(req, res) {
    try {
      const gruposistema = await GrupoSistema.findAll({
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
      });
      return res.status(200).json(gruposistema);
    } catch (error) {
      return res
        .status(500)
        .json({ error: 'Ops... estamos passando por uma instabilidade!' });
    }
  }

  async show(req, res) {
    try {
      if (!req.params.id)
        return res.status(400).json({ error: 'Informe qual Grupo!' });
      const gruposistema = await GrupoSistema.findOne({
        where: { id: req.params.id },
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
      });
      return res.status(200).json(gruposistema);
    } catch (error) {
      return res
        .status(500)
        .json({ error: 'Ops... estamos passando por uma instabilidade!' });
    }
  }

  async store(req, res) {
    // criacao de GrupoSistema
    const schema = Yup.object().shape({
      nome: Yup.string().required(() =>
        res.status(400).json({ error: 'Preencha o campo Nome!' })
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
      const { id, nome } = await GrupoSistema.create(req.body);
      return res.status(200).json({
        id,
        nome,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: 'Ops... estamos passando por uma instabilidade!' });
    }
  }

  async update(req, res) {
    // atualizacao de dados do GrupoSistema
    const schema = Yup.object().shape({
      nome: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: 'Verifique os campos obrigatórios!' });
    }
    try {
      const gruposistema = await GrupoSistema.findByPk(req.params.id); // find by primary key
      const { id, nome } = await gruposistema.update(req.body);

      if (req.body.funcoes !== undefined)
        await gruposistema.setFuncoes(req.body.funcoes);

      return res.status(200).json({
        id,
        nome,
      });
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
        .json({ error: 'Informe o status que deseja excluir!' });
    }
    try {
      await GrupoSistema.destroy({
        where: { id: req.params.id },
      });
      return res
        .status(200)
        .json({ success: `Grupo de sistema excluido com sucesso!` });
    } catch (error) {
      return res
        .status(500)
        .json({ error: `Ops... Não foi possível excluír o status.` });
    }
  }
}

export default new GrupoSistemaController();
