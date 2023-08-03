const Station = require('../models/Station.js');

// create a new station
exports.getCreateStation = (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(400).send({
      message: 'You are not authorized to create a station',
    });
  }
  res.render('station/create', {
    title: 'Create Station',
  });
};

exports.postCreateStation = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(400).send({
      message: 'You are not authorized to create a station',
    });
  }
  const station = new Station({
    name: req.body.name,
    code: req.body.code,
  });
  try {
    await station.save();
    req.flash('success', { msg: 'Station has been created successfully.' });
    res.redirect('/stations');
  } catch (err) {
    req.flash('errors', { msg: err.message });
    res.redirect('/');
  }
};

// getAllStations
exports.getAllStations = async (req, res, next) => {
  try {
    const stations = await Station.find();
    res.locals.stations = stations;
    next();
  } catch (err) {
    req.flash('errors', { msg: 'Failed to fetch stations' });
    res.redirect('/');
  }
};
// getAllStationsApi
exports.getAllStationsApi = async (req, res) => {
  try {
    const stations = await Station.find();
    res.json(stations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stations' });
  }
};

// getStationById
exports.getStationById = async (req, res, next) => {
  try {
    const station = await Station.findById(req.params.id);
    res.params.station = station;
    next();
  } catch (err) {
    req.flash('errors', { msg: err.message });
    res.redirect('/');
  }
};

// updateStationById
exports.getUpdateStationById = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(400).send({
      message: 'You are not authorized to update a station',
    });
  }
  try {
    const station = await Station.findById(req.params.id);
    res.render('stations/edit', {
      title: 'Edit Station',
      station,
    });
  } catch (err) {
    req.flash('errors', { msg: err.message });
    res.redirect('/');
  }
};
exports.postUpdateStationById = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(400).send({
      message: 'You are not authorized to update a station',
    });
  }
  try {
    await Station.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      code: req.body.code,
    });
    req.flash('success', { msg: 'Station has been updated successfully.' });
    res.redirect('/');
  } catch (err) {
    req.flash('errors', { msg: err.message });
    res.redirect('/');
  }
};
