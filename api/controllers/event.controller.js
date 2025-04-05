import Event from '../models/event.models.js';
import APIFeatures from '../utils/apiFeatures.js';
import AppError from '../utils/appError.js';

export const createEvent = async (req, res, next) => {
  try {
    const {createdBy, title, description, date, color, meetingLink, isRecurring } = req.body;
    
    const newEvent = await Event.create({
      title,
      description,
      date,
      color,
      meetingLink,
      isRecurring,
      createdBy,
    });

    res.status(201).json({
      status: 'success',
      data: {
        event: newEvent
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getAllEvents = async (req, res, next) => {
  try {
    const features = new APIFeatures(
      Event.find(),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const events = await features.query;

    res.status(200).json({
      status: 'success',
      results: events.length,
      data: {
        events
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getEventsForDate = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const specificEvents = await Event.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
    const total = await Event.countDocuments()
     


    res.status(200).json({
      success: true,
      count: specificEvents.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: specificEvents
  });
  } catch (err) {
    next(err);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!event) {
      return next(new AppError('No event found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        event
      }
    });
  } catch (err) {
    next(err);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findOneAndDelete(req.params.eventId);

    if (!event) {
      return next(new AppError('No event found with that ID', 404));
    }

    res.status(204).json("delete success");
  } catch (err) {
    next(err);
  }
};