import Sequelize, { Model } from 'sequelize';

class Cidade extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: Sequelize.STRING,
      },
      { tableName: 'cidade', paranoid: true, sequelize }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Estado, {
      foreignKey: 'estado_id',
      as: 'estado',
    });
    this.belongsToMany(models.Acao, {
      through: 'acao_cidade',
      as: 'cidades',
      foreignKey: 'cidade_id',
    });
  }
}

export default Cidade;
