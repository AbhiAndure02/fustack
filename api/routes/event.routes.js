import express from 'express';
import {
  createEvent,
  getAllEvents,
  getEventsForDate,
  updateEvent,
  deleteEvent
} from '../controllers/event.controller.js';

const router = express.Router();




router
  .route('/')
  .get(getAllEvents)
  .post(createEvent);

router
  .route('/:id')
  .get(getEventsForDate)
  .patch(updateEvent)
  .delete(deleteEvent);

router.get('/date/:date', getEventsForDate);

export default router;