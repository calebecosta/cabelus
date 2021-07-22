import * as Yup from 'yup';
import { Sequelize, Op } from 'sequelize';
import { parseISO, startOfDay } from 'date-fns';

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
  
    const cliente = await Cliente.findByPk(req.usuario_id);
    const whereStatement = {};
    const { data_inicio = '', data_fim = '' } = req.query;

    if(!cliente){
      return res
      .status(500)
      .json({ error: 'Cliente não identificado.' });
    }
  
    const colaborador = await Colaborador.findByPk(req.usuario_id);

    if(!colaborador){
      return res
      .status(500)
      .json({ error: 'Colaborador não identificado.' });
    }


    if(req.tipo_usuario === 'cli')
      whereStatement.cliente_id = req.usuario_id;

     else if (req.tipo_usuario === 'col'){
      whereStatement.colaborador_id = req.usuario_id;
    }

    console.log(whereStatement);
    try { 
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

  async indexAdmFilter(req, res) { 
    const { data_inicio = '', data_fim = '', cliente_id = '', colaborador_id = '' } = req.query;
    const whereStatement = {};

    if(req.tipo_usuario === 'cli' || req.tipo_usuario === 'col'){
        return res
          .status(401)
          .json({ error: 'Não permitido. ' });
      }

    try { 

    if (data_inicio && data_inicio !== '' && (!data_fim || data_fim === ''))
        whereStatement.data = {
          [Op.gte]: startOfDay(parseISO(data_inicio))
        };
    else if (
      data_fim &&
      data_fim !== '' &&
      (!data_inicio || data_inicio === '')
    )
      whereStatement.data = {
        [Op.lte]: startOfDay(parseISO(data_fim))
      };
    else if (data_inicio && data_inicio !== '' && data_fim && data_fim !== '')
      whereStatement.data = {
        [Op.gte]: startOfDay(parseISO(data_inicio)),
        [Op.lte]: startOfDay(parseISO(data_fim))
      };


    if(cliente_id && cliente_id !== '')
      whereStatement.cliente_id = cliente_id;

    if (colaborador_id && colaborador_id  !== ''){
      whereStatement.colaborador_id = colaborador_id;
    }


      const agendamento = await Agendamento.findAll({
        where : whereStatement,
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
 
    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: `Verifique os campos obrigatórios!` });
    }

    try {
      const cliente = await Cliente.findByPk(req.usuario_id);

      if(!cliente){
        return res
        .status(500)
        .json({ error: 'Cliente não identificado.' });
      }
      
      req.body.cliente_id = cliente.id;
      
      const colaborador = await Colaborador.findByPk(req.body.colaborador_id);
    
       if (!colaborador)
        return res.status(400).json({ error: `Cabelereiro não identificado! Por favor, tente novamente.` });

      
      const hora_inicio = startOfHour(parseISO(req.body.data));
      const hora_fim = endOfHour(parseISO(req.body.data));
      
        const agendamentoExists =  await Agendamento.findAll({
        where: {
          colaborador_id : req.body.colaborador_id,
          data: {
            [Op.between]: [hora_inicio,hora_fim]
          },
        }
      });
      
      if (agendamentoExists)
         return res.status(400).json({ error: `Horário/dia não disponivel para este cabelereiro. Por favor, tente novamente.` });


      const agendamento = await Agendamento.create(
          req.body
      );

      const { id, titulo } = agendamento;
      return res.status(200).json({
        id,
        titulo,
      });

    } catch (error) {
      console.log('error > ', error);

      return res
        .status(500)
        .json({ error: 'Ops... estamos passando por uma instabilidade!' });
    }
  }


  async delete(req, res) {
    try {
    if (!req.params.id) {
      return res
        .status(500)
        .json({ error: 'Informe o agendamento que deseja excluir!' });
    }

    const cliente = await Cliente.findByPk(req.usuario_id);
    const agendamento = await Agendamento.findByPk(req.params.id);
    const data_atual = new Date();


    if(!cliente){
      return res
      .status(500)
      .json({ error: 'Cliente não identificado.' });
    }
  
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

    if(cliente.id != agendamento.cliente_id){
      return res
      .status(500)
      .json({ error: 'Exclusão não permitida' });
    }
   
      await Agendamento.destroy({
        where: { id: req.params.id },
      });
      return res.status(200).json({ success: `Agendamento excluído com sucesso!` });
    } catch (error) {
      console.log("erro ao exclir>>>",error)
      return res
        .status(500)
        .json({ error: `Ops... Não foi possível excluír o agendamento.` });
    }
  }

}

export default new AgendamentoController();
