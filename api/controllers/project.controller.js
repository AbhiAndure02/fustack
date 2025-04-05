import Project from '../models/project.models.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
export const getProjects = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 2. Get registers with pagination
    const project = await Project.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    // 3. Get total count for pagination info
    const total = await Project.countDocuments();

    res.status(200).json({
        success: true,
        count: project.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        data: project
    });
});

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
export const createProject = asyncHandler(async (req, res) => {
  const { name, description, status, deadline, createdBy } = req.body;
  
  const project = await Project.create({
    name,
    description,
    status,
    deadline,
    createdBy
  });
  
  res.status(201).json(project);
});

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  
  // // Verify user owns the project
  // if (project.createdBy.toString() !== req.userid.toString()) {
  //   res.status(401);
  //   throw new Error('Not authorized to update this project');
  // }
  
  const updatedProject = await Project.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  res.status(200).json(updatedProject);
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  
  // Verify user owns the project

  
  res.status(200).json({ success: true });
});

// @desc    Get project statistics
// @route   GET /api/projects/stats
// @access  Private
export const getProjectStats = asyncHandler(async (req, res) => {
  const stats = await Project.aggregate([
    { $match: { createdBy: req.user.id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  res.status(200).json(stats);
});