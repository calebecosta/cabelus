module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('cidade', {
      id: {
        type: Sequelize.INTEGER, // tipo inteiro
        allowNull: false, // nao pode ser null
        autoIncrement: true, // auto increment
        primaryKey: true, // chave primaria da tabela
      },
      estado_id: {
        type: Sequelize.INTEGER,
        references: { model: 'estado', key: 'id' },
        onDelete: 'SET NULL',
        allowNull: false,
      },
      nome: {
        type: Sequelize.STRING(200),
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

  down: (queryInterface) => queryInterface.dropTable('cidade'),
};
