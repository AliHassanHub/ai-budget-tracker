import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
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
  },
  { _id: false },
);

const budgetRuleSchema = new mongoose.Schema(
  {
    categories: {
      type: [categorySchema],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const BudgetRule = mongoose.model('BudgetRule', budgetRuleSchema);

export default BudgetRule;
