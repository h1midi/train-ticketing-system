const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  train: { type: mongoose.Schema.Types.ObjectId, ref: 'Train', required: true },
  source: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true,
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true,
  },
  used: {
    type: Boolean,
    default: false,
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Train.routes',
    required: true,
  },
  payment_status: {
    type: String,
    required: true,
    enum: ['pending', 'completed'],
    default: 'pending',
  },
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
