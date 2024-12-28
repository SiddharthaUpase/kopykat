import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
  },
  password: {
    type: String,
  },
  image: {
    type: String,
  },
  googleId: {
    type: String,
  },
  callToAction: {
    type: String,
    default: '',
  }
}, {
  timestamps: true,
  collection: 'users'
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User; 