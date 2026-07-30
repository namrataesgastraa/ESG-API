'use strict';

module.exports = {
  async up(queryInterface) {
    const existing = await queryInterface.sequelize.query(
      `SELECT id FROM "JobOpenings" LIMIT 1;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (existing.length > 0) {
      console.log('Job openings already exist');
      return;
    }

    const now = new Date();

    await queryInterface.bulkInsert('JobOpenings', [
      {
        title: 'GHG & Carbon Accounting Associate',
        department: 'Carbon Accounting & Emissions Measurement',
        location: 'Pune, India',
        employment_type: 'Full-time',
        experience_min: 1,
        experience_max: 3,
        summary: 'Build GHG inventories and product carbon footprints to the GHG Protocol and ISO 14064-1 for manufacturing and industrial clients.',
        responsibilities: JSON.stringify([
          'Build Scope 1, 2 and 3 GHG inventories to the GHG Protocol Corporate Standard',
          'Support product carbon footprint and embedded emissions assessments for CBAM-impacted clients',
          'Maintain emission factor registers and Inventory Management Plans',
          'Prepare assurance-ready documentation for third-party verification',
        ]),
        requirements: JSON.stringify([
          '1 to 3 years of experience in carbon accounting, sustainability, or environmental engineering',
          'Working knowledge of the GHG Protocol and ISO 14064-1',
          'Strong Excel and data handling skills',
          'Clear written communication for client-facing documentation',
        ]),
        sort_order: 0,
        is_active: true,
        is_delete: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'BRSR & ESG Reporting Consultant',
        department: 'ESG Compliance, Reporting & Assurance',
        location: 'Pune, India',
        employment_type: 'Full-time',
        experience_min: 2,
        experience_max: 5,
        summary: 'Lead BRSR and BRSR Core disclosure engagements end to end, from data collection through assurance coordination.',
        responsibilities: JSON.stringify([
          'Manage BRSR and BRSR Core disclosure cycles for client engagements',
          'Coordinate data collection across client business units and functions',
          'Prepare GRI-aligned content indices and ISSB S1/S2 readiness assessments',
          'Liaise with assurance providers on evidence and disclosure quality',
        ]),
        requirements: JSON.stringify([
          '2 to 5 years in ESG reporting, sustainability consulting, or related assurance work',
          'Familiarity with BRSR, GRI, and ISSB frameworks',
          'Experience managing multi-stakeholder data collection',
          'Comfortable working directly with client leadership teams',
        ]),
        sort_order: 1,
        is_active: true,
        is_delete: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'CBAM & Carbon Markets Analyst',
        department: 'CBAM Advisory & Compliance',
        location: 'Pune, India',
        employment_type: 'Full-time',
        experience_min: 1,
        experience_max: 4,
        summary: 'Support CBAM exposure assessments and CCTS readiness work for exporters and regulated industrial clients.',
        responsibilities: JSON.stringify([
          'Conduct CBAM exposure and financial impact assessments for EU-bound exporters',
          'Support embedded emissions calculations and CBAM data pack preparation',
          'Assist with CCTS applicability and GEI gap assessments',
          'Track regulatory updates across CBAM and CCTS frameworks',
        ]),
        requirements: JSON.stringify([
          '1 to 4 years of experience in trade compliance, carbon markets, or ESG advisory',
          "Understanding of EU CBAM and India's CCTS framework is a strong plus",
          'Analytical mindset with strong attention to detail',
          'Willingness to work across multiple client sectors',
        ]),
        sort_order: 2,
        is_active: true,
        is_delete: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'ESG Data & Platform Associate',
        department: 'ESG Data Systems, MRV & Managed Support',
        location: 'Pune, India',
        employment_type: 'Full-time',
        experience_min: 1,
        experience_max: 3,
        summary: 'Support the design and rollout of ESG data architecture and digital MRV systems on the ESG Astraa Platform.',
        responsibilities: JSON.stringify([
          'Support ESG data architecture and digital MRV design for client rollouts',
          'Assist with data quality checks and platform configuration',
          'Provide carbon data PMO support across live client engagements',
          'Coordinate with the product team on platform feature requirements',
        ]),
        requirements: JSON.stringify([
          '1 to 3 years of experience in data operations, analytics, or ESG technology',
          'Comfortable working with structured datasets and dashboards',
          'Basic understanding of ESG or sustainability reporting is a plus',
          'Strong organisational and cross-team coordination skills',
        ]),
        sort_order: 3,
        is_active: true,
        is_delete: false,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    console.log('Job openings seeded');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('JobOpenings', null, {});
  }
};
