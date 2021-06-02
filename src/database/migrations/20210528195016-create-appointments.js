module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('appointments', {
      id: {

        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      date: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      user_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' }, // foreign key
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
      },

      provider_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' }, // foreign key
        onUpdate: 'CASCADE', // Quando for atualizar,atualizar as outras que estao relacionadas
        onDelete: 'SET NULL', // Caso deletado, os dados relacionados viram null
        allowNull: true,
      },

      canceled_at: {
        type: Sequelize.DATE,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('appointments');
  },
};
