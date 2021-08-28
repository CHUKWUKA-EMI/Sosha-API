"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Chat", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      friendshipId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      senderId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      senderName: {
        type: Sequelize.STRING,
      },
      receiverId: {
        type: Sequelize.UUID,
      },
      receiverName: {
        type: Sequelize.STRING,
      },
      message: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("Chat");
  },
};
