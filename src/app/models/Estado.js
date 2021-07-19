import Sequelize, { Model } from 'sequelize';

class Estado extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: Sequelize.STRING,
        sigla: Sequelize.STRING,
      },
      { tableName: 'estado', paranoid: true, sequelize }
    );

    return this;
  }
}

export default Estado;
