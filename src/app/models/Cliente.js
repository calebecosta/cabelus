import Sequelize, { Model } from 'sequelize';

class Cliente extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: Sequelize.STRING,
        email: Sequelize.STRING,
        endereco: Sequelize.STRING,
        senha: Sequelize.VIRTUAL, // este campo nunca existira na base de dados, somente aqui
        senha_hash: Sequelize.STRING,
      },
      { tableName: 'cliente', paranoid: true, sequelize }
    );

    return this;
  }
}

export default Cliente;
