'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('CaseStudies');

    const columns = {
      slug: { type: Sequelize.STRING, allowNull: true },
      subtitle: { type: Sequelize.STRING, allowNull: true },
      eyebrow: { type: Sequelize.STRING, allowNull: true },
      industry_tag: { type: Sequelize.STRING, allowNull: true },
      category_tags: { type: Sequelize.JSON, allowNull: true },
      published_date: { type: Sequelize.STRING, allowNull: true },
      read_time: { type: Sequelize.STRING, allowNull: true },
      author_name: { type: Sequelize.STRING, allowNull: true },
      cover_image: { type: Sequelize.STRING, allowNull: true },
      cover_alt: { type: Sequelize.STRING, allowNull: true },
      cover_caption: { type: Sequelize.STRING, allowNull: true },
      summary_content: { type: Sequelize.JSON, allowNull: true },
      key_insights: { type: Sequelize.JSON, allowNull: true },
      related_case_studies: { type: Sequelize.JSON, allowNull: true },
      featured: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    };

    for (const [name, definition] of Object.entries(columns)) {
      if (!table[name]) {
        await queryInterface.addColumn('CaseStudies', name, definition);
      }
    }

    await queryInterface.changeColumn('CaseStudies', 'category_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.changeColumn('CaseStudies', 'pdf_file', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('CaseStudies');

    const names = [
      'slug', 'subtitle', 'eyebrow', 'industry_tag', 'category_tags',
      'published_date', 'read_time', 'author_name', 'cover_image',
      'cover_alt', 'cover_caption', 'summary_content', 'key_insights',
      'related_case_studies', 'featured',
    ];

    for (const name of names) {
      if (table[name]) {
        await queryInterface.removeColumn('CaseStudies', name);
      }
    }

    await queryInterface.changeColumn('CaseStudies', 'pdf_file', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('CaseStudies', 'category_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
