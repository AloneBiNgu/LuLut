import { Router } from 'express';
import { createResource, getResources, createResourceRequest } from '../controllers/resourceController';

const router = Router();

router.get('/', getResources);
router.post('/', createResource);
router.post('/requests', createResourceRequest);

export default router;
