"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      "User", // table name
      "phone_verification_code", // new field name
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("User", "phone_verification_code");
  },
};
