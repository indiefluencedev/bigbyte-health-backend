import { Router } from 'express';
import { createAppointment } from '../controllers/appointmentController';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { MulterError } from 'multer';

// Multer setup for file handling
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // Ensure this directory exists or create it
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb: FileFilterCallback) => {
    // Accept only certain file types
    const fileTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (extName && mimeType) {
      cb(null, true);
    } else {
      cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'Only images and documents are allowed.'));
    }
  },
});

const router = Router();

// Route to handle the appointment form submission
router.post('/', upload.array('medicalHistory', 15), async (req, res) => {
  try {
    // Delegate to the controller
    await createAppointment(req, res);
  } catch (error) {
    console.error('Error processing appointment:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
