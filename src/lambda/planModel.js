// planModel.js
import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  plan: Object,
  eventCode: {
    type: String,
    max: 50
  }
  // name: {
  //   type: String,
  //   required: [true, 'Name field is required'],
  //   max: 200
  // }
}),
Plan = mongoose.model('plan', schema)
export default Plan