import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
    },
    password: String,
    email: {
      type: String,
      require: true,
      unique: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('User', userSchema)
