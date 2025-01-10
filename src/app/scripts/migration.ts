import connectDB from '../lib/mongodb';
import User from '../models/User';

async function migrateUsers() {
  try {
    await connectDB();
    
    // Update all users without registrationIP
    await User.updateMany(
      { registrationIP: { $exists: false } },
      { $set: { registrationIP: '0.0.0.0' } }
    );
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration if needed
// migrateUsers(); 