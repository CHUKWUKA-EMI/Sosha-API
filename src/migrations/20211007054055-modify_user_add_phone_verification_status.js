"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      "User", // table name
      "phone_verified", // new field name
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("User", "phone_verified");
  },
};
