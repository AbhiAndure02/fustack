import express from 'express';

import { createProject, deleteProject, getProjects, getProjectStats, updateProject } from '../controllers/project.controller.js';

const router = express.Router();

router.get('/get-project', getProjects);
router.post('/create-project', createProject);
router.put('/update-project/:id', updateProject);
router.delete('/delete-project/:id', deleteProject);


router.route('/:id')
  .put(updateProject)
  .delete(deleteProject);

export default router;
