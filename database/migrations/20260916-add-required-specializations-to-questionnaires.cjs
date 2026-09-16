const { DataTypes } = require('sequelize')

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add required_specializations column to questionnaires
    await queryInterface.addColumn('questionnaires', 'required_specializations', {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      comment: 'Array of required specializations for respondents. Empty array = accept all.'
    })

    console.log('✅ Added required_specializations column to questionnaires')
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('questionnaires', 'required_specializations')
  }
}
