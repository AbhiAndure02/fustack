import express from "express";
import { createActivity, deleteActivity, getAllActivities, updateActivity } from "../controllers/activity.controller.js";

const router = express.Router();

router.post('/', createActivity);
router.get('/', getAllActivities);
router.put('/:id', updateActivity);
router.delete('/:id', deleteActivity);

export default router;
