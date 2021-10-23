"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      "Tweet", // table name
      "videoUrl", // new field name
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("Tweet", "videoUrl");
  },
};
