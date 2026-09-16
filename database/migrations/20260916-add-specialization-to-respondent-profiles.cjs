const { DataTypes } = require('sequelize')

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add specialization column to respondent_profiles
    await queryInterface.addColumn('respondent_profiles', 'specialization', {
      type: DataTypes.TEXT,
      allowNull: true, // Nullable for existing records
      comment: 'Respondent specialization/field of expertise'
    })

    console.log('✅ Added specialization column to respondent_profiles')
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('respondent_profiles', 'specialization')
  }
}
