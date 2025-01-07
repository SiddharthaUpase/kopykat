import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: String,  // Optional for Google auth users
  image: String,
  googleId: String,  // Add this field
  createdAt: {
    type: Date,
    default: Date.now,
  },
  registrationIP: {
    type: String,
    required: true,
  }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User; 