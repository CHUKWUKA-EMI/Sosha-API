"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      "User", // table name
      "user_role", // new field name
      {
        type: Sequelize.STRING,
        defaultValue: "user",
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("User", "user_role");
  },
};
