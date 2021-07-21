module.exports = {
  up: (queryInterface, Sequelize) =>
  queryInterface.createTable('agendamento', {
    id: {
      type: Sequelize.INTEGER, 
      allowNull: false, 
      autoIncrement: true,
      primaryKey: true, 
    },
    cliente_id: {
      type: Sequelize.INTEGER,
      references: { model: 'cliente', key: 'id' },
      onDelete: 'SET NULL',
      allowNull: false,
    },
    colaborador_id: {
      type: Sequelize.INTEGER,
      references: { model: 'colaborador', key: 'id' },
      onDelete: 'SET NULL',
      allowNull: false,
    },
    data_cancelado: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    data: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    observacao: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    deleted_at: {
      type: Sequelize.DATE,
    },
  }),

down: (queryInterface) => queryInterface.dropTable('agendamento')
}
