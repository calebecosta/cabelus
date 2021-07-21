module.exports = {
  up: (queryInterface, Sequelize) =>
  queryInterface.createTable('cliente', {
    id: {
      type: Sequelize.INTEGER, 
      allowNull: false, 
      autoIncrement: true, 
      primaryKey: true,
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
    endereco: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    senha_hash: {
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

down: (queryInterface) => queryInterface.dropTable('cliente'),
};
