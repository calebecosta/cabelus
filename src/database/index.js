import Sequelize from 'sequelize';

import databaseConfig from '../config/database';
import FuncaoSistema from '../app/models/FuncaoSistema';
import GrupoSistema from '../app/models/GrupoSistema';
import Usuario from '../app/models/Usuario';
import Agendamento from '../app/models/Agendamento';
import Cliente from '../app/models/Cliente';
import Colaborador from '../app/models/Colaborador';

const models = [
  FuncaoSistema,
  GrupoSistema,
  Usuario,
  Agendamento,
  Cliente,
  Colaborador
];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);
    models
      .map((model) => model.init(this.connection))
      .map(
        (model) => model.associate && model.associate(this.connection.models)
      );
  }
}

export default new Database();
