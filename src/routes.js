import { Router } from 'express';
import multer from 'multer';
import cors from 'cors';

import multerConfig from './config/multer';
import authMiddleware from './app/middlewares/auth';
import FuncaoSistemaController from './app/controllers/FuncaoSistemaController';
import GrupoSistemaController from './app/controllers/GrupoSistemaController';
import UsuarioController from './app/controllers/UsuarioController';
import ColaboradorController from './app/controllers/ColaboradorController';
import ClienteController from './app/controllers/ClienteController';
import SessionController from './app/controllers/SessionController';

import AgendamentoController from './app/controllers/AgendamentoController';
import AgendaController from './app/controllers/AgendaController';





const routes = new Router();
const upload = multer(multerConfig);

routes.use(cors());

routes.post('/usuario', UsuarioController.store); // Cadastro de Usuario
routes.get('/usuario/:id', UsuarioController.show); // Listar um usuario

routes.post('/colaborador', ColaboradorController.store); // Cadastro de Usuario
routes.get('/colaborador/:id', ColaboradorController.show); // Listar um usuario

routes.post('/session', SessionController.store); // Criacao de Session


/**
 * se passar pela autenticacao, eh continuado o fluxo das rotas
 */
routes.use(authMiddleware);

/**
 * Inicio rotas funcaosistema
 */
routes.get('/funcaosistema', FuncaoSistemaController.index); // Listar todas funcoes de sistema
routes.get('/funcaosistema/:id', FuncaoSistemaController.show); // Listar uma funcao de sistema
routes.post('/funcaosistema', FuncaoSistemaController.store); // Criacao de funcaosistemas
routes.put('/funcaosistema/:id', FuncaoSistemaController.update); // Alteracao de funcaosistema
routes.delete('/funcaosistema/:id', FuncaoSistemaController.delete); // Deletar uma funcao de sistema

/**
 * Inicio rotas gruposistema
 */
routes.get('/gruposistema', GrupoSistemaController.index); // Listar todas funcoes de sistema
routes.get('/gruposistema/:id', GrupoSistemaController.show); // Listar uma funcao de sistema
routes.post('/gruposistema', GrupoSistemaController.store); // Criacao de gruposistemas
routes.put('/gruposistema/:id', GrupoSistemaController.update); // Alteracao de gruposistema
routes.delete('/gruposistema/:id', GrupoSistemaController.delete); // Deletar uma funcao de sistema

/**
 * Inicio rotas usuario
 */
routes.get('/usuario', UsuarioController.index); // Listar todos usuarios
routes.put('/usuario/:id', UsuarioController.update); // Alterar de dados do usuario
routes.delete('/usuario/:id', UsuarioController.delete); // Deletar um usuario

/**
 * Inicio rotas colaborador
 */
routes.get('/colaborador', ColaboradorController.index); // Listar todos colaboradores
routes.put('/colaborador/:id', ColaboradorController.update); // Alterar de dados do colaborador
routes.delete('/colaborador/:id', ColaboradorController.delete); // Deletar um colaborador
/**
 * Inicio rotas cliente
 */
routes.get('/cliente', ClienteController.index); // Listar todos cliente
routes.get('/cliente/:id', ClienteController.show); // Listar um cliente
routes.put('/cliente/:id', ClienteController.update); // Alterar de dados do cliente
routes.delete('/cliente/:id', ClienteController.delete); // Deletar um cliente


/**
 * Inicio rotas agendamento
 */
routes.post('/agendamento', AgendamentoController.store); // Criar um agendamento
routes.get('/agendamento/', AgendamentoController.index); // Listar todos agendamentos realizados 
routes.get('/agendamento/:id', AgendamentoController.show); // Listar um agendamento
routes.delete('/agendamento/:id', AgendamentoController.delete); // Deletar um cliente

/**
 * Inicio rotas agenda
 */
// routes.get('/agenda', AgendaController.show); // Listar a agenda


export default routes;
