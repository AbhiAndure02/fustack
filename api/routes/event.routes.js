import express from 'express';
import {
  createEvent,
  getAllEvents,
  getEventsForDate,
  
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
  .delete(deleteEvent);



export default router;
