import { Model } from 'sequelize';

class PescadorAcao extends Model {
  static init(sequelize) {
    super.init({}, { tableName: 'pescador_acao', sequelize });

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Pescador, {
      foreignKey: 'pescador_id',
      as: 'pescador',
    });
    this.belongsTo(models.Acao, {
      foreignKey: 'acao_id',
      as: 'acao',
    });
    this.belongsTo(models.Arquivo, {
      foreignKey: 'assinatura_id',
      as: 'assinatura',
    });
    this.belongsTo(models.Arquivo, {
      foreignKey: 'selfie_id',
      as: 'selfie',
    });
  }
}

export default PescadorAcao;
