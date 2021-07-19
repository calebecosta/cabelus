import Sequelize from 'sequelize';

import databaseConfig from '../config/database';
import FuncaoSistema from '../app/models/FuncaoSistema';
import GrupoSistema from '../app/models/GrupoSistema';
import Usuario from '../app/models/Usuario';
import Estado from '../app/models/Estado';
import Cidade from '../app/models/Cidade';

const models = [
  FuncaoSistema,
  GrupoSistema,
  Usuario,
  Estado,
  Cidade,

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
