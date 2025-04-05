import mongoose from "mongoose";
import env from "dotenv";
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// 1. Basic Configuration
env.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());

// 2. Route Validation Middleware (Fixes the path-to-regexp error)
app.use((req, res, next) => {
  if (req.path.includes('://')) {
    console.error(`⚠️ Invalid route detected: ${req.path}`);
    return res.status(400).json({ error: "Route paths cannot contain URLs" });
  }
  next();
});

// 3. Safe Route Imports
const loadRoutes = async () => {
  try {
    const { default: authRoutes } = await import('./routes/auth.routes.js');
    const { default: registerRoutes } = await import('./routes/register.routes.js');
    const { default: projectRoutes } = await import('./routes/project.route.js');
    const { default: activityRoutes } = await import('./routes/activity.routes.js');
    const { default: eventRoutes } = await import('./routes/event.routes.js');

    app.use('/api/auth', authRoutes);
    app.use('/api/registers', registerRoutes);
    app.use('/api/project', projectRoutes);
    app.use('/api/activity', activityRoutes);
    app.use('/api/events', eventRoutes);
    
    console.log("✅ Routes mounted successfully");
  } catch (err) {
    console.error("❌ Failed to load routes:", err);
    process.exit(1);
  }
};

// 4. Database Connection
mongoose.connect(process.env.MONGO)
  .then(() => {
    console.log("✅ MongoDB Connected");
    return loadRoutes();
  })
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// 5. Static Files (Optional - Only if frontend exists)
const staticPath = path.join(__dirname, '../landingPage/dist');
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
  console.log(`✅ Serving static files from ${staticPath}`);
} else {
  console.warn(`⚠️  Frontend build not found at ${staticPath}`);
}

// 6. Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
  🚀 Server running on port ${PORT}
  🛠️  Mode: ${process.env.NODE_ENV || 'development'}
  `);
});

// 7. Basic Error Handling
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: "Internal Server Error" });
});