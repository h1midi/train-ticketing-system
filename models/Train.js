const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  departure_time: { type: String, required: true },
});

const trainSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true, unique: true },
  seats: { type: Number, required: true },
  source: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  stops: [stopSchema], // Array of stops with station and departure_time
});

const Train = mongoose.model('Train', trainSchema);

module.exports = Train;
