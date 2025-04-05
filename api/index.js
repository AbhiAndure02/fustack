import mongoose from "mongoose";
import env from "dotenv";
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import registerAuth from "./routes/register.routes.js";
import projectRoutes from "./routes/project.route.js";
import activityRoutes from "./routes/activity.routes.js";
import eventRoutes from "./routes/event.routes.js";

// Load environment variables first
env.config();

const app = express();
app.use(express.json());


const PORT = process.env.PORT || 3000;

// Connect to MongoDB before starting the server
mongoose.connect(process.env.MONGO)
  .then(() => {
    console.log("Connected to MongoDB");
    
    // Start server only after DB connection is established
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
    process.exit(1);
  });

// API Routes (must come first)
app.get('/', (req, res) => {
  res.send("Hello World");
});

app.use('/api/auth', authRoutes);
app.use('/api/registers', registerAuth);
app.use('/api/project', projectRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/events', eventRoutes);

// Serve static files from the frontend dist folder

// Error handler middleware (should be after all other middleware/routes)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  res.status(statusCode).json({ 
    success: false,
    statusCode,
    message
  });
});