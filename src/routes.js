import { Router } from 'express';
import multer from 'multer';
import cors from 'cors';

import multerConfig from './config/multer';
import authMiddleware from './app/middlewares/auth';
import FuncaoSistemaController from './app/controllers/FuncaoSistemaController';
import GrupoSistemaController from './app/controllers/GrupoSistemaController';
import UsuarioController from './app/controllers/UsuarioController';
import SessionController from './app/controllers/SessionController';

import AgendamentoController from './app/controllers/AgendamentoController';
import AgendaController from './app/controllers/AgendaController';


import EstadoController from './app/controllers/EstadoController';
import CidadeController from './app/controllers/CidadeController';


import EsqueciSenhaController from './app/controllers/EsqueciSenhaController';

const routes = new Router();
const upload = multer(multerConfig);

routes.use(cors());

routes.post('/usuario', UsuarioController.store); // Cadastro de Usuario
routes.get('/usuario/:id', UsuarioController.show); // Listar um usuario

routes.post('/session', SessionController.store); // Criacao de Session

routes.post('/esqueci-senha', EsqueciSenhaController.store); // Esqueceu senha


/**
 * Inicio rotas Estado
 */
routes.get('/estado/:id', EstadoController.show); // Listar um estado
routes.get('/estado', EstadoController.index); // Listar todos estado

/**
 * Inicio rotas Cidade
 */
routes.get('/cidade/:id', CidadeController.show); // Listar um cidade
routes.get('/cidade', CidadeController.index); // Listar todos cidade


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
routes.put('/usuario/:id?', UsuarioController.update); // Alterar de dados do usuario
routes.delete('/usuario/:id', UsuarioController.delete); // Deletar um usuario


/**
 * Inicio rotas agendamento
 */
routes.post('/agendamento', AgendamentoController.store); // Criar um agendamento
routes.get('/agendamento/:id', AgendamentoController.show); // Listar um agendamento
routes.put('/agendamento/:id', AgendamentoController.update); // Alterar dados de um agendamento 
routes.delete('/agendamento/:id', AgendamentoController.delete); // Deletar um agendamento

/**
 * Inicio rotas agenda
 */
routes.get('/agenda', AgendaController.show); // Listar a agenda


export default routes;
