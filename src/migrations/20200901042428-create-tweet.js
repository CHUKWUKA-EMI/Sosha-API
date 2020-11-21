"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      "Tweet",
      {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        content: {
          type: Sequelize.TEXT,
        },
        imgUrl: {
          type: Sequelize.TEXT,
        },
        UserId: {
          type: Sequelize.UUID,
          allowNull: false,
        },

        createdAt: {
          type: Sequelize.DATE,
        },
        updatedAt: {
          type: Sequelize.DATE,
        },
      },
      { timestamps: true }
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("Tweet");
  },
};
