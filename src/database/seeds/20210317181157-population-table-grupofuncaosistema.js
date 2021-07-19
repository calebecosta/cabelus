module.exports = {
  up: (queryInterface) =>
    queryInterface.bulkInsert(
      'grupofuncaosistema',
      [
        {
          id: 1,
          gruposistema_id: 1,
          funcaosistema_id: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    ),

  down: (queryInterface) =>
    queryInterface.bulkDelete('grupofuncaosistema', null, {}),
};
