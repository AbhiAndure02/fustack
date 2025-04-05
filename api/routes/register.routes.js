
import express from 'express';
import { deleteRegister, getRegisters, register } from '../controllers/register.controller.js';

const router = express.Router();


router.post('/register', register)
router.get('/getregister', getRegisters)
router.delete("/deleteregister/:registerId", deleteRegister);


export default router;