import * as Yup from 'yup';
import { Sequelize, Op } from 'sequelize';

import Colaborador from '../models/Colaborador';
import databaseConfig from '../../config/database';
import NovoAgendamentoMail from '../jobs/NovoAgendamentoMail';
import Queue from '../../lib/Queue';
import Agendamento from '../models/Agendamento';
import Cliente from '../models/Cliente';


class AgendamentoController {
  async index(req, res) {
    try {
      const agendamento = await Agendamento.findAll({
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'deletedAt'],
        },
        include: [
          {
            model: Colaborador,
            as: 'colaboradores',
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'deletedAt'],
            },
          },
          {
            model: Cliente,
            as: 'clientes',
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'deletedAt'],
            },
          }
        ],
      });
      return res.status(200).json(agendamento);
    } catch (error) {
      console.log(error)
      return res
        .status(500)
        .json({ error: 'Ops... estamos passando por uma instabilidade!' });
    }
  }


  async show(req, res) {
    try {
    
      const agendamento = await Agendamento.findOne({
        where: { id: req.params.id },
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'deletedAt'],
        },
      });
      return res.status(200).json(agendamento);
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ error: 'Ops... estamos passando por uma instabilidade!' });
    }
  }

  async store(req, res) {
    // criando agendamentos
    const schema = Yup.object().shape({
      colaborador_id: Yup.string().required(() =>
        res.status(400).json({ error: `Preencha o cabelereiro para o qual deseja agendar !` })
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
      const colaborador = await Colaborador.findByPk(req.body.colaborador_id);

      //restrigindo pela existencia de um agendamento com data e hora iguais para o dia selecionado 
      
      const isRange =  await Colaborador.findAll({
        where: {
          [Op.and]: db.literal(`EXISTS(SELECT * FROM "agendamento" WHERE "agendamento"."data" = '${req.body.data}'  AND "agendamento"."colaborador_id" = ${req.body.colaborador_id})`)
        }
      });

      if (Array.isArray(isRange) && isRange.length)
         return res.status(400).json({ error: `Agendamento não disponivel para este cabelereiro. Por favor, tente novamente.` });



      if (!colaborador)
        return res.status(400).json({ error: `Cabelereiro não identificado!` });
        //data virá do front
        req.body.data = new Date(Date.now()).toISOString();

      const agendamento = await Agendamento.create(
        {
          ...req.body,
        },
        { transaction }
      );

      const arrayEmails = [];
        arrayEmails.push(colaborador.email);

      // await Queue.add(NovoAgendamentoMail.key, {
      //   objeto: agendamento.objeto,
      //   mailto: arrayEmails,
      // });
      // If the execution reaches this line, no errors were thrown.
      // We commit the transaction.
      await transaction.commit();
      const { id, titulo } = agendamento;
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
        .json({ error: 'Informe o agendamento que deseja excluir!' });
    }
    try {
      await Agendamento.destroy({
        where: { id: req.params.id },
      });
      return res.status(200).json({ success: `Agendamento excluído com sucesso!` });
    } catch (error) {
      return res
        .status(500)
        .json({ error: `Ops... Não foi possível excluír o agendamento.` });
    }
  }

}

export default new AgendamentoController();
