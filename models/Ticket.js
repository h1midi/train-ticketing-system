const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  train: { type: mongoose.Schema.Types.ObjectId, ref: 'Train', required: true },
  source: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  date_of_journey: { type: Date, required: true },
  seat_number: { type: Number, required: true },
  fare: { type: Number, required: true },
  payment_status: { type: String, required: true, enum: ['pending', 'completed'], default: 'pending' },
  payment_id: { type: String },
  qr_code: { type: String, required: true },
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
