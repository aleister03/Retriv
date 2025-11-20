const Admin = require('../models/Admin');

const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@system.com' });
    
    if (!existingAdmin) {
      const admin = new Admin({
        name: 'System Administrator',
        email: 'admin@system.com',
        password: 'admin123', // This will be hashed by the pre-save middleware
        department: 'IT Department',
        employeeId: 'ADMIN001'
      });
      
      await admin.save();
      console.log('Default admin created successfully');
      console.log('Email: admin@system.com');
      console.log('Password: admin123');
    } else {
      console.log('Admin already exists');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
};

module.exports = seedAdmin;
