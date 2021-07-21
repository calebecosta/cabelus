import Sequelize, { Model } from 'sequelize';

class Agendamento extends Model {
  static init(sequelize) {
    super.init(
      {
        observacao: Sequelize.STRING,
        data_cancelado: Sequelize.DATE,
        data : Sequelize.DATE,
      },
      { tableName: 'agendamento', paranoid: true, sequelize }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Cliente, {
      foreignKey: 'cliente_id',
      as: 'clientes',
    });
    this.belongsTo(models.Colaborador, {
      foreignKey: 'colaborador_id',
      as: 'colaboradores',
    });
  }
}

export default Agendamento;
