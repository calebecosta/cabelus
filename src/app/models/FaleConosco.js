import Sequelize, { Model } from 'sequelize';

class FaleConosco extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: Sequelize.STRING,
        email: Sequelize.STRING,
        cpf: Sequelize.STRING,
        celular: Sequelize.STRING,
        mensagem: Sequelize.TEXT,
      },
      { tableName: 'faleconosco', paranoid: true, sequelize }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Cidade, {
      foreignKey: 'cidade_id',
      as: 'cidade',
    });
  }
}

export default FaleConosco;
