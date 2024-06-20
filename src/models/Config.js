import mongoose from 'mongoose'

const configSchema = new mongoose.Schema({
  views: [
    {
      type: String,
    },
  ],
  content: {
    type: String,
  },
  progress: {
    type: Number,
  },
})

export default mongoose.model('Config', configSchema)
