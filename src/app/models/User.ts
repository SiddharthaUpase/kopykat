import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot be more than 50 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function(this: { accountType?: string }) {
      return this.accountType === 'credentials';
    }
  },
  googleId: {
    type: String,
    sparse: true
  },
  image: String,
  registrationIP: {
    type: String,
    required: function(this: { accountType?: string }) {
      return this.accountType === 'credentials';
    }
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  accountType: {
    type: String,
    enum: ['credentials', 'google'],
    required: true
  }
});

userSchema.index({ googleId: 1 }, { sparse: true });

export default mongoose.models.User || mongoose.model('User', userSchema); 