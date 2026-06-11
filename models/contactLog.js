'use strict';

module.exports = (sequelize, DataTypes) => {
  const ContactLog = sequelize.define('ContactLog', {

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    form_type: {
      type: DataTypes.STRING,
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

    payload: {
      type: DataTypes.JSONB,
      allowNull: true
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false
    },

    error_message: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    sent_at: {
      type: DataTypes.DATE,
      allowNull: true
    },

    is_delete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }

  }, {
    tableName: 'ContactLogs',
    timestamps: true
  });

  ContactLog.associate = () => {};

  return ContactLog;
};
