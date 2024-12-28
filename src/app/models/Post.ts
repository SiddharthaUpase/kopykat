import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  tone: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);
export default Post; 