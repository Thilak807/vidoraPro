 import { Schema, model } from 'mongoose';

const summarySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  url: { type: String, required: true },
  language: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default model('Summary', summarySchema);       