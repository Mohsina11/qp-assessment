import express from 'express';
import AdminController from '../controllers/admin';

const router = express.Router();
const adminController = new AdminController();

router.post('/additem', adminController.addItem);
router.get('/viewitems', adminController.viewItems);
router.delete('/removeitem/:groceryId', adminController.removeItem);
router.put('/updateitem/:groceryId', adminController.updateItem);
router.put('/manageinventory/:groceryId', adminController.manageInventory);

export default router;
