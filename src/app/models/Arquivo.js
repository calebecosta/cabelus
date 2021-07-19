import Sequelize, { Model } from 'sequelize';

class Arquivo extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: Sequelize.STRING,
        key: Sequelize.STRING,
        path: Sequelize.STRING,
      },
      { tableName: 'arquivo', paranoid: true, sequelize }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.TipoArquivo, {
      foreignKey: 'tipoarquivo_id',
      as: 'tipo_arquivo',
    });
  }
}

export default Arquivo;
