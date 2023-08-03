const mongoose = require('mongoose');

const route = new mongoose.Schema({
  source: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true,
  },
  time: { type: Date, required: true },
  stops: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  ],
});

const trainSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true, unique: true },
  seats: { type: Number, required: true },
  routes: [route],
});

const Train = mongoose.model('Train', trainSchema);

module.exports = Train;
