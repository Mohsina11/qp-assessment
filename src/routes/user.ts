import express from 'express';
import UserController from '../controllers/user';

const router = express.Router();
const userController = new UserController();

router.get('/viewitems', userController.viewItems);
router.post('/:userId/bookitems', userController.bookItems);
router.post('/signup', userController.addUser);


export default router;
