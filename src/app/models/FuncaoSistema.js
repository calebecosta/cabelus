import Sequelize, { Model } from 'sequelize';

class FuncaoSistema extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: Sequelize.STRING,
      },
      { tableName: 'funcaosistema', paranoid: true, sequelize }
    );

    return this;
  }

  static associate(models) {
    this.belongsToMany(models.GrupoSistema, {
      through: 'grupofuncaosistema',
      as: 'grupos',
      foreignKey: 'funcaosistema_id',
    });
  }
}

export default FuncaoSistema;
