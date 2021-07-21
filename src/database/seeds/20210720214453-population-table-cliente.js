module.exports = {
  up: (queryInterface) =>
    queryInterface.bulkInsert(
      'cliente',
      [
        {
          id: 1,
          nome: 'Calebe',
          email: 'calebe+cliente@clickativo.com.br',
          endereco: 'Avenida Antônio Gil Veloso - de 2202 a 2610 lado par, Itapuã, Vila Velha - ES',
          senha_hash:
            '$2a$08$uFrjBr6bxTXiND4oGxOXdO27Lk.50i/Xkp/6Nmf9DP/cMeISsxCoi', // 123456
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    ),

  down: (queryInterface) => queryInterface.bulkDelete('cliente', null, {}),
};
