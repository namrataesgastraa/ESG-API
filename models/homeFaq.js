'use strict';

module.exports = (sequelize, DataTypes) => {
  const HomeFaq = sequelize.define('HomeFaq', {

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    question: {
      type: DataTypes.STRING,
      allowNull: false
    },

    answer: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },

    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER

  }, {
    tableName: 'HomeFaqs',
    timestamps: true
  });

  return HomeFaq;
};
