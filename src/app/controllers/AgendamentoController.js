import * as Yup from 'yup';
import { Sequelize, Op } from 'sequelize';

import { parseISO,differenceInHours,format,endOfHour,startOfHour, formatDistance, formatRelative, subDays } from 'date-fns'
import Colaborador from '../models/Colaborador';
import databaseConfig from '../../config/database';
import NovoAgendamentoMail from '../jobs/NovoAgendamentoMail';
import Queue from '../../lib/Queue';
import Agendamento from '../models/Agendamento';
import Usuario from '../models/Usuario';
import GrupoSistema from '../models/GrupoSistema';
import FuncaoSistema from '../models/FuncaoSistema';
import Cliente from '../models/Cliente';


class AgendamentoController {
  async index(req, res) { 
    try {
      const usuario = await Usuario.findOne({
        where: { id: req.usuario_id},
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

                  ],
                },
              },
            ],
          },
        ],
      });


      let whereStatement = {};
      if(usuario){
        whereStatement = "";
      }else{
        whereStatement.id = req.usuario_id;
      }

      const agendamento = await Agendamento.findAll({
        where: whereStatement,
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'deletedAt'],
        },
        include: [
          {
            model: Colaborador,
            as: 'colaboradores',
            attributes: {
              exclude: ['createdAt','senha_hash', 'updatedAt', 'deletedAt'],
            },
          },
          {
            model: Cliente,
            as: 'clientes',
            attributes: {
              exclude: ['createdAt', 'senha_hash','updatedAt', 'deletedAt'],
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
      data: Yup.string().required(() =>
        res.status(400).json({ error: `Preencha o campo data!` })
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
    
       if (!colaborador)
        return res.status(400).json({ error: `Cabelereiro não identificado! Por favor, tente novamente.` });
        
      //data virá do front
      const hora_inicio = startOfHour(parseISO(req.body.data));
      const hora_fim = endOfHour(parseISO(req.body.data));
      
        const isRange =  await Agendamento.findAll({
        where: {
          colaborador_id : req.body.colaborador_id,
          data: {
            [Op.between]: [hora_inicio,hora_fim]
          },
        }
      });
      
      if (Array.isArray(isRange) && isRange.length)
         return res.status(400).json({ error: `Horário/dia não disponivel para este cabelereiro. Por favor, tente novamente.` });


      const agendamento = await Agendamento.create(
        {
          ...req.body,
        },
        { transaction }
      );

      // const arrayEmails = [];
      //   arrayEmails.push(colaborador.email);

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

    const agendamento = await Agendamento.findByPk(req.params.id);
    const data_atual = new Date();

    if(!agendamento){
      return res
      .status(500)
      .json({ error: 'Agendamento inexistente.' });
    }

    if(differenceInHours(data_atual,agendamento.data) > 2) {
      console.log("diff horas>",differenceInHours(data_atual,agendamento.data))
      return res
      .status(500)
      .json({ error: 'Agendamento não pode ser cancelado por estar fora do período carencia (2h).' });
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
