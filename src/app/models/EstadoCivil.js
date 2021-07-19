import Sequelize, { Model } from 'sequelize';

class EstadoCivil extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: Sequelize.STRING,
      },
      { tableName: 'estadocivil', paranoid: true, sequelize }
    );

    return this;
  }
}

export default EstadoCivil;
