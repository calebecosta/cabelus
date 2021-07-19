module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('usuario', {
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
      nome: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      login: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      senha_hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      ativo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

  down: (queryInterface) => queryInterface.dropTable('usuario'),
};
