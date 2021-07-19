module.exports = {
  up: (queryInterface) =>
    queryInterface.bulkInsert(
      'gruposistema',
      [
        {
          id: 1,
          nome: 'Administrador',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    ),

  down: (queryInterface) => queryInterface.bulkDelete('gruposistema', null, {}),
};
