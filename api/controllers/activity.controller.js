import Activity from "../models/activity.models.js";
import { errorHandler } from "../utils/error.js";


export const createActivity = async (req, res, next) => {
    const {userId, activity, projectId, timestamp, status } = req.body;
    try {
        // Validation
        if (!userId || userId === ""  || !activity || activity === "") {
            return next(errorHandler(400, "All fields are required"));
        }

        // Create new activity
        const activity1 = await Activity.create({
            activity,
            userId,
            projectId,
            timestamp,
            status
        });
        
        res.status(201).json(activity1);
        
    } catch (error) {
        return next(errorHandler(500, error.message));
        
    }
}

export const getAllActivities = async (req, res, next) => {
    try {
        const activities = await Activity.find();
        res.status(200).json(activities);
    } catch (error) {
        return next(errorHandler(500, "Internal server error"));
    }
}
export const updateActivity = async (req, res, next) => {
    const { id } = req.params;
    const { activity, userId, projectId, timestamp, status } = req.body;
    try {
       

        const updatedActivity = await Activity.findByIdAndUpdate(id, { activity, userId, projectId, timestamp, status }, { new: true });
        if (!updatedActivity) {
            return next(errorHandler(404, "Activity not found"));
        }
        res.status(200).json(updatedActivity);
    } catch (error) {
        return next(errorHandler(500, "Internal server error"));
    }
}

export const deleteActivity = async (req, res, next) =>{
    const { id } = req.params;
    try {
        const activity = await Activity.findByIdAndDelete(id);
        if (!activity) {
            return next(errorHandler(404, "Activity not found"));
        }
        res.status(200).json({ message: "Activity deleted successfully" });
    } catch (error) {
        return next(errorHandler(500, "Internal server error"));
    }
}