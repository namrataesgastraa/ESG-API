'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },

    name: {
      type: DataTypes.STRING,
      allowNull: true
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false
    },

    mobile_number: {
      type: DataTypes.STRING,
      allowNull: true
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false
    },

    is_superadmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },

    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },

    is_delete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },

    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    }

  }, {
    tableName: 'Users',
    timestamps: true
  });

  User.associate = (models) => {
    // empty intentionally
  };

  return User;
};