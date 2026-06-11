'use strict';

module.exports = (sequelize, DataTypes) => {
  const BlogReference = sequelize.define('BlogReference', {

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    blog_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    reference_order: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false
    }

  }, {
    tableName: 'BlogReferences',
    timestamps: true
  });

  BlogReference.associate = (models) => {
    BlogReference.belongsTo(models.Blog, {
      foreignKey: 'blog_id',
      as: 'blog'
    });
  };

  return BlogReference;
};
