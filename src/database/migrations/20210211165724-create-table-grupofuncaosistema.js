module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('grupofuncaosistema', {
      id: {
        type: Sequelize.INTEGER, // tipo inteiro
        allowNull: false, // nao pode ser null
        autoIncrement: true, // auto increment
        primaryKey: true, // chave primaria da tabela
      },
      gruposistema_id: {
        type: Sequelize.INTEGER,
        references: { model: 'gruposistema', key: 'id' },
        onDelete: 'SET NULL',
        allowNull: false,
      },
      funcaosistema_id: {
        type: Sequelize.INTEGER,
        references: { model: 'funcaosistema', key: 'id' },
        onDelete: 'SET NULL',
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

  down: (queryInterface) => queryInterface.dropTable('grupofuncaosistema'),
};
