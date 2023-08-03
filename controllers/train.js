const Train = require('../models/train');
const Station = require('../models/Station');

// create a new train
exports.getCreateTrain = (req, res) => {
  res.render('train/create', {
    pageTitle: 'Create Train',
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
    res.redirect('/trains');
  } catch (err) {
    res.status(500).json(`error: ${err}`);
  }
};

// delete a train
exports.deleteTrain = async (req, res) => {
  try {
    await Train.findByIdAndDelete(req.params.id);
    req.flash('success', { msg: 'Train has been deleted successfully.' });
    res.redirect('/trains');
  } catch (err) {
    req.flash('errors', { msg: err.message });
    res.redirect('/');
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
      pageTitle: 'Trains',
    });
  } catch (err) {
    console.log('From catch block');
    console.log(err);
    req.flash('errors', { msg: err.message });
    res.redirect('/');
  }
};

// get all trains
// exports.getTrains = async (req, res) => {
//   try {
//     const trains = await Train.find()
//       .populate('routes.source')
//       .populate('routes.stops');
//     res.render('train/index', {
//       trains,
//       pageTitle: 'Trains',
//     });
// res.status(200).json(trains);
//   } catch (err) {
//     res.status(500).json(err.message);
//   }
// };

// get a train
// exports.getTrain = async (req, res) => {
//   try {
//     const train = await Train.findById(req.params.id);
//     res.render('train', {
//       train,
//       pageTitle: train.name,
//       path: '/trains',
//     });
//   } catch (err) {
//     req.flash('errors', { msg: err.message });
//     res.redirect('/');
//   }
// };

// update a train
// exports.getUpdateTrain = async (req, res) => {
//   try {
//     const train = await Train.findById(req.params.id);
//     res.render('update-train', {
//       train,
//       pageTitle: train.name,
//       path: '/trains',
//     });
//   } catch (err) {
//     req.flash('errors', { msg: err.message });
//     res.redirect('/');
//   }
// };

// exports.postUpdateTrain = async (req, res) => {
//   const { name, number, seats, source, destination, stops, time } = req.body;
//   try {
//     const train = await Train.findById(req.params.id);
//     train.name = name;
//     train.number = number;
//     train.seats = seats;
//     train.trageds = [{ source, destination, stops, time }];
//     await train.save();
//     req.flash('success', { msg: 'Train has been updated successfully.' });
//     res.redirect('/trains');
//   } catch (err) {
//     req.flash('errors', { msg: err.message });
//     res.redirect('/');
//   }
// };
