const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get admin credentials from environment or use defaults
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@qwizhub.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = process.env.ADMIN_NAME || 'System Administrator';

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Check if admin already exists
    const existingAdmin = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email = :email LIMIT 1',
      {
        replacements: { email: adminEmail },
        type: Sequelize.QueryTypes.SELECT
      }
    );

    const now = new Date();

    if (existingAdmin && existingAdmin.length > 0) {
      // Update existing admin
      await queryInterface.sequelize.query(
        `UPDATE users 
         SET name = :name,
             password = :password,
             role = :role,
             verification_status = :verificationStatus,
             updated_at = :updatedAt
         WHERE email = :email`,
        {
          replacements: {
            name: adminName,
            password: hashedPassword,
            role: 'admin',
            verificationStatus: 'verified',
            updatedAt: now,
            email: adminEmail
          }
        }
      );
      console.log(`✓ Admin account updated: ${adminEmail}`);
    } else {
      // Create new admin
      await queryInterface.bulkInsert('users', [{
        id: uuidv4(),
        name: adminName,
        email: adminEmail,
        email_verified: now,
        password: hashedPassword,
        role: 'admin',
        verification_status: 'verified',
        image: null,
        total_questionnaires_answered: 0,
        total_honor_earned: 0,
        total_honor_withdrawn: 0,
        ai_token_balance: 0,
        created_at: now,
        updated_at: now
      }]);
      console.log(`✓ Admin account created: ${adminEmail}`);
    }

    console.log('');
    console.log('Admin credentials:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('');
    console.log('⚠️  Please change the admin password after first login!');
  },

  down: async (queryInterface, Sequelize) => {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@qwizhub.com';
    
    await queryInterface.sequelize.query(
      'DELETE FROM users WHERE email = :email AND role = :role',
      {
        replacements: { 
          email: adminEmail,
          role: 'admin'
        }
      }
    );
    
    console.log(`✓ Admin account removed: ${adminEmail}`);
  }
};
