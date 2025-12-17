import express from 'express';
import { ValidateAddressController } from '../controllers/validateAddress.controller.js';

const router = express.Router();

/**
 * POST /validate-address
 * Validates and standardizes a US address
 */
router.post('/validate-address', ValidateAddressController.validateAddress);

export default router;
