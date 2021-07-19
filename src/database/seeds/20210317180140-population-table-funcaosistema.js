module.exports = {
  up: (queryInterface) =>
    queryInterface.bulkInsert(
      'funcaosistema',
      [
        {
          id: 1,
          nome: 'Acesso ao Módulo de Processos',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          nome: 'Acesso ao Módulo de Pescadores',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 3,
          nome: 'Acesso ao Módulo de Adesões',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 4,
          nome: 'Acesso ao Fale Conosco',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 5,
          nome: 'Acesso aos Módulo Relatórios',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 6,
          nome: 'Acesso às Configurações',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 7,
          nome: 'Acesso ao Módulo de Segurança',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    ),

  down: (queryInterface) =>
    queryInterface.bulkDelete('funcaosistema', null, {}),
};
