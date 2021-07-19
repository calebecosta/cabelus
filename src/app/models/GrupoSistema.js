import Sequelize, { Model } from 'sequelize';

class GrupoSistema extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: Sequelize.STRING,
      },
      { tableName: 'gruposistema', paranoid: true, sequelize }
    );

    return this;
  }

  static associate(models) {
    this.belongsToMany(models.FuncaoSistema, {
      through: 'grupofuncaosistema',
      as: 'funcoes',
      foreignKey: 'gruposistema_id',
    });
  }
}

export default GrupoSistema;
