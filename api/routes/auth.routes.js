import express from 'express';
import { getuser, logout, registerUser, signin } from '../controllers/auth.controller.js';

const router =express.Router();

router.post('/register', registerUser)
router.post('/login', signin)
router.post('/logout', logout)
router.get('/getmember', getuser)

export default router;
