import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    userId: {
        type:String,
        required: true,
    },
    projectId: {
        type: String,
        ref: 'Project',
    },
    activity: {
        type:String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['pending', 'In Progress', 'completed'],
        default: 'pending',
    },

 

});

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;