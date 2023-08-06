const Train = require('../models/train');
const Station = require('../models/Station');

// create a new train
exports.getCreateTrain = (req, res) => {
  res.render('train/create', {
    title: 'Create Train',
  });
};

exports.postCreateTrain = async (req, res) => {
  const { name, number, seats, ...routesData } = req.body;
  try {
    const routes = [];

    const numRoutes = Object.keys(routesData).filter((key) =>
      key.startsWith('source-')
    ).length;

    for (let i = 0; i < numRoutes; i++) {
      const source = routesData[`source-${i}`];
      const departureTime = routesData[`time-${i}`];
      const price = routesData[`price-${i}`];
      const selectedStops = Array.isArray(routesData[`selected-stops-${i}`])
        ? routesData[`selected-stops-${i}`]
        : [routesData[`selected-stops-${i}`]];
      const stops = selectedStops.map((stopId) => ({
        stop: stopId,
      }));

      console.log(selectedStops);
      routes.push({
        source,
        time: Date.parse(departureTime),
        price,
        stops: selectedStops,
      });
    }

    const train = new Train({
      name,
      number,
      seats,
      routes,
    });

    await train.save();
    req.flash('success', { msg: 'Train has been created successfully.' });
    res.redirect('/dashboard');
  } catch (err) {
    res.status(500).json(`error: ${err}`);
  }
};

// delete a train
exports.deleteTrain = async (req, res) => {
  try {
    await Train.findByIdAndDelete(req.params.id);
    req.flash('success', { msg: 'Train has been deleted successfully.' });
    res.redirect('/dashboard');
  } catch (err) {
    req.flash('errors', { msg: err.message });
    res.redirect('/dashboard');
  }
};

// search trains
exports.searchTrains = async (req, res) => {
  const { source, destination } = req.body;
  try {
    console.log(`dist: ${source}`);
    const sourceStation = await Station.findOne({ name: source });
    const destinationStation = await Station.findOne({ name: destination });
    if (!sourceStation || !destinationStation) {
      throw new Error('Invalid source or destination');
    }
    const sourceId = sourceStation._id;
    const destinationId = destinationStation._id;
    const originalArray = await Train.find({
      $or: [
        {
          'routes.source': sourceId,
          'routes.stops': { $in: [destinationId] },
        },
        {
          $and: [
            { 'routes.stops': { $in: [sourceId] } },
            { 'routes.stops': { $in: [destinationId] } },
          ],
        },
      ],
    })
      .populate('routes.source', 'name')
      .populate('routes.stops', 'name');
    const trains = [];
    const seenTrains = new Set();
    originalArray.forEach((train) => {
      const uniqueRoutes = train.routes.filter(
        (route) =>
          (route.source._id.toString() === sourceId.toString() &&
            route.stops.some(
              (stop) => stop._id.toString() === destinationId.toString()
            )) ||
          (route.stops.some(
            (stop) => stop._id.toString() === sourceId.toString()
          ) &&
            route.stops.some(
              (stop) => stop._id.toString() === destinationId.toString()
            ))
      );
      if (uniqueRoutes.length > 0 && !seenTrains.has(train._id.toString())) {
        trains.push({
          _id: train._id,
          name: train.name,
          number: train.number,
          seats: train.seats,
          routes: uniqueRoutes,
        });
        seenTrains.add(train._id.toString());
      }
    });
    res.render('train/index', {
      trains,
      destinationId,
      title: 'Search',
    });
  } catch (err) {
    req.flash('errors', { msg: err.message });
    res.redirect('/dashboard');
  }
};

// get all trains
exports.getTrains = async (req, res, next) => {
  try {
    const trains = await Train.find()
      .populate('routes.source')
      .populate('routes.stops');
    res.locals.trains = trains;
    next();
  } catch (err) {
    res.status(500).json(err.message);
  }
};

exports.renderTrainPage = async (req, res) => {
  const trains = res.locals.trains;
  res.render('train/index', {
    trains,
    title: 'Available Trains',
  });
};
// get a train
exports.getTrain = async (req, res) => {
  try {
    const train = await Train.findById(req.params.id)
      .populate('routes.source')
      .populate('routes.stops');
    res.render('train/train', {
      train,
      title: train.name,
    });
  } catch (err) {
    req.flash('errors', { msg: err.message });
    res.redirect('/dashboard');
  }
};

// update a train
exports.getUpdateTrain = async (req, res) => {
  try {
    const train = await Train.findById(req.params.id);
    res.render('train/edit', {
      train,
      title: train.name,
    });
  } catch (err) {
    req.flash('errors', { msg: err.message });
    res.redirect('/dashboard');
  }
};

exports.postUpdateTrain = async (req, res) => {
  const { name, number, seats } = req.body;
  try {
    const train = await Train.findById(req.params.id);
    train.name = name;
    train.number = number;
    train.seats = seats;
    await train.save();
    req.flash('success', { msg: 'Train has been updated successfully.' });
    res.redirect('/dashboard');
  } catch (err) {
    req.flash('errors', { msg: err.message });
    res.redirect('/dashboard');
  }
};

// delete a route
exports.deleteRoute = async (req, res) => {
  try {
    const train = await Train.findById(req.params.tid);
    train.routes = train.routes.filter(
      (route) => route._id.toString() !== req.params.rid
    );
    await train.save();
    req.flash('success', { msg: 'Route has been deleted successfully.' });
    res.redirect(`/trains/id/${req.params.tid}`);
  } catch (err) {
    req.flash('errors', { msg: err.message });
    res.redirect('/dashboard');
  }
};

// add a route
exports.getAddRoute = async (req, res) => {
  try {
    const train = await Train.findById(req.params.id);
    const stations = await Station.find();
    res.render('train/add_route', {
      train,
      stations,
      title: 'Add Route',
    });
  } catch (err) {
    req.flash('errors', { msg: err.message });
    res.redirect('/dashboard');
  }
};

exports.postAddRoute = async (req, res) => {
  const { source, time, price, ...routesData } = req.body;
  try {
    const train = await Train.findById(req.params.id);

    const selectedStops = Array.isArray(routesData[`selected-stops-0`])
      ? routesData[`selected-stops-0`]
      : [routesData[`selected-stops-0`]];

    train.routes.push({
      source,
      time: Date.parse(time),
      price,
      stops: selectedStops,
    });

    await train.save();
    req.flash('success', { msg: 'Train has been created successfully.' });
    res.redirect('/dashboard');
  } catch (err) {
    res.status(500).json(`error: ${err.message}`);
  }
};
