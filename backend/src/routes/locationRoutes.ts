import { Router } from 'express';
import { createLocation, getLocations, getLocationById } from '../controllers/locationController';

const router = Router();

router.get('/', getLocations);
router.get('/:id', getLocationById);

router.post('/', createLocation);

export default router;
