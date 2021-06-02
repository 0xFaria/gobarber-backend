module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.addColumn(
    'users', // qual tabela
    'avatar_id', // qual o nome da coluna
    {
      type: Sequelize.INTEGER,
      references: { model: 'files', key: 'id' }, // foreign key
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true,
    },
  ),

  down: async (queryInterface) => queryInterface.removeColumn('users', 'avatar_id'),
};
