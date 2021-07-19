module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('gruposistema', {
      id: {
        type: Sequelize.INTEGER, // tipo inteiro
        allowNull: false, // nao pode ser null
        autoIncrement: true, // auto increment
        primaryKey: true, // chave primaria da tabela
      },
      nome: {
        type: Sequelize.STRING,
        allowNull: false,
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

  down: (queryInterface) => queryInterface.dropTable('gruposistema'),
};
