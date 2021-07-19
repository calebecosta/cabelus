import * as Yup from 'yup';
import FuncaoSistema from '../models/FuncaoSistema';

class FuncaoSistemaController {
  async index(req, res) {
    try {
      const funcaosistema = await FuncaoSistema.findAll({
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'deletedAt'],
        },
      });
      return res.status(200).json(funcaosistema);
    } catch (error) {
      return res
        .status(500)
        .json({ error: 'Ops... estamos passando por uma instabilidade!' });
    }
  }

  async show(req, res) {
    try {
      const funcaosistema = await FuncaoSistema.findOne({
        where: { id: req.params.id },
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'deletedAt'],
        },
      });
      return res.status(200).json(funcaosistema);
    } catch (error) {
      return res
        .status(500)
        .json({ error: 'Ops... estamos passando por uma instabilidade!' });
    }
  }

  async store(req, res) {
    // criacao de FuncaoSistema
    const schema = Yup.object().shape({
      nome: Yup.string().required(() =>
        res.status(400).json({ error: `Preencha o campo Nome!` })
      ),
    });

    /**
     * De a cordo com as regras a cima
     * validamos os dados com o yupi
     */
    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: `Verifique os campos obrigatórios!` });
    }
    try {
      const { id, nome } = await FuncaoSistema.create(req.body);
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
    // atualizacao de dados do FuncaoSistema
    const schema = Yup.object().shape({
      nome: Yup.string(() =>
        res.status(400).json({ error: 'Preencha o campo Nome!' })
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: 'Verifique os campos obrigatórios!' });
    }

    if (!req.params.id)
      return res
        .status(400)
        .json({ error: 'Informe a Função que dejesa alterar!' });

    try {
      const funcaosistema = await FuncaoSistema.findByPk(req.params.id); // find by primary key

      const { id, nome } = await funcaosistema.update(req.body);

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
      await FuncaoSistema.destroy({
        where: { id: req.params.id },
      });
      return res
        .status(200)
        .json({ success: `Função de sistema excluido com sucesso!` });
    } catch (error) {
      return res
        .status(500)
        .json({ error: `Ops... Não foi possível excluír o status.` });
    }
  }
}

export default new FuncaoSistemaController();
