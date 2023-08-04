const Ticket = require('../models/ticket');
const Train = require('../models/train');

// create a new ticket
exports.getBookTicket = (req, res) => {
  res.render('ticket/tickets', {
    pageTitle: 'Create Ticket',
  });
};

exports.postBookTicket = async (req, res) => {
  const { train, source, destination, route } = req.params;
  const ticket = new Ticket({
    user: req.user._id,
    train,
    source,
    destination,
    route,
  });
  try {
    await ticket.save();
    req.flash('success', { msg: 'Ticket has been created successfully.' });
    res.redirect('/tickets');
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// get all tickets
exports.getTickets = async (req, res) => {
  try {
    const rts = [];
    const tickets = await Ticket.find({ user: req.user._id })
      .populate('user')
      .populate('train')
      .populate('source')
      .populate('destination');
    await Promise.all(
      tickets.map(async (ticket) => {
        const train = await Train.findById(ticket.train._id).populate({
          path: 'routes',
          populate: {
            path: 'source stops',
            model: 'Station',
          },
        });
        rts.push(
          train.routes.filter(
            (r) => r._id.toString() === ticket.route.toString()
          )
        );
      })
    );
    res.render('ticket/tickets', {
      routes: rts,
      tickets,
      title: 'My Tickets',
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// cancel a ticket
exports.cancelTicket = async (req, res) => {
  try {
    await Ticket.findByIdAndDelete(req.params.id);
    console.log('Ticket has been canceled successfully.');
    res.redirect('/tickets');
  } catch (err) {
    req.flash('errors', { msg: err.message });
    res.redirect('/');
  }
};
