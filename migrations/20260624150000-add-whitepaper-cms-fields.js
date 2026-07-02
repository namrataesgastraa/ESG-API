'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('WhitePapers');

    const columns = {
      slug: { type: Sequelize.STRING, allowNull: true },
      subtitle: { type: Sequelize.STRING, allowNull: true },
      eyebrow: { type: Sequelize.STRING, allowNull: true },
      industry_tag: { type: Sequelize.STRING, allowNull: true },
      category_tags: { type: Sequelize.JSON, allowNull: true },
      published_date: { type: Sequelize.STRING, allowNull: true },
      read_time: { type: Sequelize.STRING, allowNull: true },
      author_name: { type: Sequelize.STRING, allowNull: true },
      report_type: { type: Sequelize.STRING, allowNull: true },
      pages: { type: Sequelize.STRING, allowNull: true },
      frameworks_covered: { type: Sequelize.JSON, allowNull: true },
      cover_image: { type: Sequelize.STRING, allowNull: true },
      cover_alt: { type: Sequelize.STRING, allowNull: true },
      cover_caption: { type: Sequelize.STRING, allowNull: true },
      summary_content: { type: Sequelize.JSON, allowNull: true },
      key_insights: { type: Sequelize.JSON, allowNull: true },
      related_whitepapers: { type: Sequelize.JSON, allowNull: true },
      graphical_enabled: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      graphs: { type: Sequelize.JSON, allowNull: true },
      featured: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    };

    for (const [name, definition] of Object.entries(columns)) {
      if (!table[name]) {
        await queryInterface.addColumn('WhitePapers', name, definition);
      }
    }

    await queryInterface.changeColumn('WhitePapers', 'category_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.changeColumn('WhitePapers', 'pdf_file', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('WhitePapers');

    const names = [
      'slug', 'subtitle', 'eyebrow', 'industry_tag', 'category_tags',
      'published_date', 'read_time', 'author_name', 'report_type', 'pages',
      'frameworks_covered', 'cover_image', 'cover_alt', 'cover_caption',
      'summary_content', 'key_insights', 'related_whitepapers',
      'graphical_enabled', 'graphs', 'featured',
    ];

    for (const name of names) {
      if (table[name]) {
        await queryInterface.removeColumn('WhitePapers', name);
      }
    }

    await queryInterface.changeColumn('WhitePapers', 'pdf_file', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('WhitePapers', 'category_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
