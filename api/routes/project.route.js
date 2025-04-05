import express from 'express';

import { createProject, deleteProject, getProjects, getProjectStats, updateProject } from '../controllers/project.controller.js';

const router = express.Router();

router.route('/')
  .get( getProjects
  )
  .post(createProject);


router.route('/:id')
  .put(updateProject)
  .delete(deleteProject);

export default router;