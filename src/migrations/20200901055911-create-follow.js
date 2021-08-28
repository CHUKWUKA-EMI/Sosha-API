"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("friend", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      requesterId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      friendId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      friendship: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      requeststatus: {
        type: Sequelize.STRING,
        defaultValue: "pending",
      },
      blocked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
      },
      updatedAt: {
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("Follows");
  },
};
