import * as Yup from 'yup';
import { Sequelize, Op } from 'sequelize';
import Cidade from '../models/Cidade';
import Estado from '../models/Estado';
import Usuario from '../models/Usuario';
import databaseConfig from '../../config/database';
import NovoAgendamentoMail from '../jobs/NovoAgendamentoMail';
import Queue from '../../lib/Queue';

class AgendaController {
  async index(req, res) {
    try {
      const acao = await Agenda.findAll({
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'deletedAt'],
        },
        include: [
          {
            model: Cidade,
            as: 'cidades',
            through: { attributes: [] }, // nao retornar dados da tabela pivot
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'deletedAt'],
            },
            include: [
              {
                model: Estado,
                as: 'estado',
                attributes: {
                  exclude: ['createdAt', 'updatedAt', 'deletedAt'],
                },
              },
            ],
          },
        ],
      });
      return res.status(200).json(acao);
    } catch (error) {
      return res
        .status(500)
        .json({ error: 'Ops... estamos passando por uma instabilidade!' });
    }
  }

  async indexCount(req, res) {
    try {
      const qtdAcao = await Acao.count();
      return res.status(200).json(qtdAcao);
    } catch (error) {
      return res
        .status(500)
        .json({ error: 'Ops... estamos passando por uma instabilidade!' });
    }
  }

  async indexPescador(req, res) {
    try {
      let pescador = null;
      if (req.usuario_id) pescador = await Pescador.findByPk(req.usuario_id);
      // find by primary key
      else return res.status(400).json({ error: 'Pescador não identificado!' });

      if (!pescador.cidade_id)
        return res.status(400).json({
          error: 'Por favor atualize seus dados e informe sua cidade!',
        });

      const adesoes = await PescadorAcao.findAll({
        attributes: ['id', 'acao_id'],
        where: {
          pescador_id: pescador.id,
        },
      });
      const arrAdesoes = [];
      adesoes.forEach((adesao) => {
        arrAdesoes.push(adesao.acao_id);
      });
      const acao = await Acao.findAll({
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'deletedAt'],
        },
        where: {
          id: {
            [Op.notIn]: arrAdesoes,
          },
        },
        include: [
          {
            model: TipoIndenizacao,
            through: { attributes: [] }, // nao retornar dados da tabela pivot
            as: 'tiposindenizacao',
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'deletedAt'],
            },
          },
          {
            model: TipoDocumento,
            through: { attributes: [] }, // nao retornar dados da tabela pivot
            as: 'tiposdocumento',
            where: {
              id: pescador.tipodocumento_id
            },
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'deletedAt'],
            },
          },
          {
            model: Juizo,
            as: 'juizo',
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'deletedAt'],
            },
          },
          {
            model: Cidade,
            as: 'cidades',
            through: { attributes: [] }, // nao retornar dados da tabela pivot
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'deletedAt'],
            },
            where: {
              id: pescador.cidade_id,
            },
          },
        ],
      });
      return res.status(200).json(acao);
    } catch (error) {
      console.log('error > ', error);
      return res
        .status(500)
        .json({ error: 'Ops... estamos passando por uma instabilidade!' });
    }
  }

  async show(req, res) {
    try {
      const acao = await Acao.findOne({
        where: { id: req.params.id },
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'deletedAt'],
        },
        include: [
          {
            model: Cidade,
            as: 'cidades',
            through: { attributes: [] }, // nao retornar dados da tabela pivot
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'deletedAt'],
            },
          },
          {
            model: TipoIndenizacao,
            through: { attributes: [] }, // nao retornar dados da tabela pivot
            as: 'tiposindenizacao',
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'deletedAt'],
            },
          },
          {
            model: TipoDocumento,
            through: { attributes: [] }, // nao retornar dados da tabela pivot
            as: 'tiposdocumento',
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'deletedAt'],
            },
          },
          {
            model: Juizo,
            as: 'juizo',
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'deletedAt'],
            },
          },
        ],
      });
      return res.status(200).json(acao);
    } catch (error) {
      return res
        .status(500)
        .json({ error: 'Ops... estamos passando por uma instabilidade!' });
    }
  }

  async store(req, res) {
    // criacao de Acao
    const schema = Yup.object().shape({
      titulo: Yup.string().required(() =>
        res.status(400).json({ error: `Preencha o campo Titulo!` })
      ),
      numero: Yup.string().required(() =>
        res.status(400).json({ error: `Preencha o campo Número!` })
      ),
      responsavel: Yup.string().required(() =>
        res.status(400).json({ error: `Preencha o campo Titulo!` })
      ),
      tiposindenizacao: Yup.array().required(() =>
        res.status(400).json({ error: `Preencha o campo Tipo de Indenização!` })
      ),
      juizo_id: Yup.string().required(() =>
        res.status(400).json({ error: `Preencha o campo Fase (Juízo)!` })
      ),
      cidades: Yup.array().required(() =>
        res.status(400).json({ error: `Preencha o campo Cidade!` })
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

    const db = new Sequelize(databaseConfig);
    const transaction = await db.transaction();
    try {
      const usuario = await Usuario.findByPk(req.usuario_id);
      if (!usuario)
        return res.status(400).json({ error: `Usuário não identificado!` });
      const acao = await Acao.create(
        {
          ...req.body,
          usuarioinsert_id: usuario.id,
          usuarioupdate_id: usuario.id,
        },
        { transaction }
      );
      if (req.body.cidades !== undefined)
        await acao.setCidades(req.body.cidades, { transaction });
      if (req.body.tiposindenizacao !== undefined)
        await acao.setTiposindenizacao(req.body.tiposindenizacao, {
          transaction,
      });
      if (req.body.tiposdocumento !== undefined)
        await acao.setTiposdocumento(req.body.tiposdocumento, {
          transaction,
      });

      const pescadores = await Pescador.findAll({
        attributes: ['email'],
        where: {
          cidade_id: req.body.cidades,
        },
      });
      const arrayEmails = [];
      pescadores.map((pesc) => {
        arrayEmails.push(pesc.email);
      });
      await Queue.add(NovaAcaoMail.key, {
        objeto: acao.objeto,
        mailto: arrayEmails,
      });
      // If the execution reaches this line, no errors were thrown.
      // We commit the transaction.
      await transaction.commit();
      const { id, titulo } = acao;
      return res.status(200).json({
        id,
        titulo,
      });
    } catch (error) {
      console.log('error > ', error);
      // If the execution reaches this line, an error was thrown.
      // We rollback the transaction.
      await transaction.rollback();
      return res
        .status(500)
        .json({ error: 'Ops... estamos passando por uma instabilidade!' });
    }
  }

  async update(req, res) {
    // atualizacao de dados do Acao
    const schema = Yup.object().shape({
      titulo: Yup.string(() =>
        res.status(400).json({ error: 'Preencha o campo Titulo!' })
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
        .json({ error: 'Informe a ação que dejesa alterar!' });

    const db = new Sequelize(databaseConfig);
    const transaction = await db.transaction();
    try {
      const usuario = await Usuario.findByPk(req.usuario_id);
      if (!usuario)
        return res.status(400).json({ error: `Usuário não identificado!` });
      const acao = await Acao.findByPk(req.params.id); // find by primary key

      await acao.update(
        {
          ...req.body,
          usuarioupdate_id: usuario.id,
        },
        { transaction }
      );
      if (req.body.cidades !== undefined)
        await acao.setCidades(req.body.cidades, { transaction });
      if (req.body.tiposindenizacao !== undefined)
        await acao.setTiposindenizacao(req.body.tiposindenizacao, {
          transaction,
      });
      if (req.body.tiposdocumento !== undefined)
        await acao.setTiposdocumento(req.body.tiposdocumento, {
          transaction,
      });

      // If the execution reaches this line, no errors were thrown.
      // We commit the transaction.
      await transaction.commit();
      const { id, titulo } = acao;
      return res.status(200).json({
        id,
        titulo,
      });
    } catch (error) {
      console.log('error > ', error);
      // If the execution reaches this line, an error was thrown.
      // We rollback the transaction.
      await transaction.rollback();
      return res
        .status(500)
        .json({ error: 'Ops... estamos passando por uma instabilidade!' });
    }
  }

  async delete(req, res) {
    if (!req.params.id) {
      return res
        .status(500)
        .json({ error: 'Informe a ação que deseja excluir!' });
    }
    try {
      await Acao.destroy({
        where: { id: req.params.id },
      });
      return res.status(200).json({ success: `Ação excluída com sucesso!` });
    } catch (error) {
      return res
        .status(500)
        .json({ error: `Ops... Não foi possível excluír a acao.` });
    }
  }

  async indexFilter(req, res) {
    try {
      const whereStatement = {};

      if (req.query.data_inicio && req.query.data_fim) {
        whereStatement.created_at = {
          [Op.between]: [`${req.query.data_inicio}`, `${req.query.data_fim}`],
        };
      }
      if (req.query.numero) whereStatement.numero = req.query.numero;
      if (req.query.responsavel)
        whereStatement.responsavel = req.query.responsavel;
      if (req.query.titulo) whereStatement.titulo = req.query.titulo;

      const whereStatementJuizo = {};
      if (req.query.juizo_id) whereStatementJuizo.id = req.query.juizo_id;

      const whereStatementTiposIndenizacao = {};
      if (req.query.tiposindenizacao)
        whereStatementTiposIndenizacao.id = req.query.tiposindenizacao;

      const whereStatementEstado = {};
      if (req.query.estado_id) whereStatementEstado.id = req.query.estado_id;

      const whereStatementCidades = {};
      if (req.query.cidades) whereStatementCidades.id = req.query.cidades;

      const acoes = await Acao.findAll({
        where: whereStatement,
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'deletedAt'],
        },
        include: [
          {
            model: TipoIndenizacao,
            through: { attributes: [] }, // nao retornar dados da tabela pivot
            as: 'tiposindenizacao',
            where: whereStatementTiposIndenizacao,
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'deletedAt'],
            },
          },
          {
            model: TipoDocumento,
            through: { attributes: [] }, // nao retornar dados da tabela pivot
            as: 'tiposdocumento',
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'deletedAt'],
            },
          },
          {
            model: Juizo,
            where: whereStatementJuizo,
            as: 'juizo',
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'deletedAt'],
            },
          },
          {
            model: Cidade,
            where: whereStatementCidades,
            as: 'cidades',
            through: { attributes: [] }, // nao retornar dados da tabela pivot
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'deletedAt'],
            },
            include: [
              {
                model: Estado,
                as: 'estado',
                where: whereStatementEstado,
                attributes: {
                  exclude: ['createdAt', 'updatedAt', 'deletedAt'],
                },
              },
            ],
          },
        ],
      });

      return res.status(200).json(acoes);
    } catch (error) {
      console.log('error > ', error);
      return res
        .status(500)
        .json({ error: 'Ops... estamos passando por uma instabilidade!' });
    }
  }
}

export default new AgendaController();
