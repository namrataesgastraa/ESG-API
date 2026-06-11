'use strict';

module.exports = (sequelize, DataTypes) => {
  const BlogTabBullet = sequelize.define('BlogTabBullet', {

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    blog_tab_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    bullet_order: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    lead: {
      type: DataTypes.STRING,
      allowNull: false
    },

    body: {
      type: DataTypes.TEXT,
      allowNull: true
    }

  }, {
    tableName: 'BlogTabBullets',
    timestamps: true
  });

  BlogTabBullet.associate = (models) => {
    BlogTabBullet.belongsTo(models.BlogTab, {
      foreignKey: 'blog_tab_id',
      as: 'tab'
    });
  };

  return BlogTabBullet;
};
