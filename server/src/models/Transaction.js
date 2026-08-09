import mongoose from 'mongoose';

const allocationSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const transactionSchema = new mongoose.Schema(
  {
    originalSentence: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    direction: {
      type: String,
      required: true,
      enum: ['income', 'expense'],
    },
    category: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    allocations: {
      type: [allocationSchema],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

transactionSchema.index({ date: 1 });
transactionSchema.index({ createdAt: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
