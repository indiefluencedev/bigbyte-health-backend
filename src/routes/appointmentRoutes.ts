import { Router } from 'express';
import { createAppointment } from '../controllers/appointmentController';

const router: Router = Router();

// Route to create a new appointment
router.post('/appointment', createAppointment);

export default router;
