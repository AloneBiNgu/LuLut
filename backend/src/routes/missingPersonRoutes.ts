import { Router } from 'express';
import { 
  createMissingPerson, 
  getMissingPersons, 
  getMissingPersonById, 
  updateMissingPersonStatus,
  updateMissingPersonLocation
} from '../controllers/missingPersonController';
import { upload } from '../middleware/upload';

const router = Router();

// Public routes
router.get('/', getMissingPersons);
router.get('/:id', getMissingPersonById);
router.post('/', upload.array('photos', 3), createMissingPerson);
router.patch('/:id/status', updateMissingPersonStatus);
router.patch('/:id/location', updateMissingPersonLocation);

export default router;
