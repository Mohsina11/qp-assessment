import { Request, Response } from 'express';
import { EntityManager, MoreThan,MoreThanOrEqual, getManager, getRepository } from 'typeorm';
import { GroceryItem } from '../entities/GroceryItem';
import { Order } from '../entities/Order';
import { UserOrder } from '../entities/UserOrderMapping';
import { User } from '../entities/User';
import dataSource from "../db/dataSourceLocal";
import { v4 as uuidv4 } from 'uuid';


type ProcessedGroceryItem = {
  groceryItem: GroceryItem;
  orderedQuantity: number;
};

class UserController {
  async viewItems(req: Request, res: Response) {
    try {
      const page: number = parseInt(req.query.page as string, 10) || 1;  
      const limit: number = parseInt(req.query.limit as string, 10) || 20; 
      const offset: number = (page - 1) * limit;
      const groceryRepository = dataSource.getRepository(GroceryItem);
      const [groceryItems, totalItems] = await groceryRepository.findAndCount({
        take: limit,
        skip: offset,
        where: {
          deleted: false,
          quantity: MoreThan(0),
        },
      });
      
      return res.json({
        success: true,
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        data: groceryItems,
      });
    } catch (error) {
      console.error('Error viewing grocery items:', error);
      return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }

  async bookItems(req: Request, res: Response) {
    try {
      // Validate required parameters
      const userId:number=parseInt(req.params.userId);
      console.log("userId",userId)
      const {items}=req.body;
      console.log(req.body);
      console.log(items);
      console.log(Array.isArray(items));
      console.log(items.length)
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Invalid order details' });
      }
  
      // Use transaction to ensure atomicity
      await dataSource.transaction(async (transactionalEntityManager: EntityManager) => {
        const groceryRepository = transactionalEntityManager.getRepository(GroceryItem);
        const orderRepository = transactionalEntityManager.getRepository(Order);
        const userOrderRepository=dataSource.getRepository(UserOrder);
        const orderId: string = uuidv4();
        let totalOrderPrice:number=0.0;
        const processedGroceryItems: ProcessedGroceryItem[] = [];
        // Validate all items and quantity requested for items are first
        for (const item of items) {
          const { groceryId, quantity } = item;
            if (!groceryId || !quantity || quantity <= 0) {
            return res.status(400).json({ error: 'Invalid item details in the order' });
          }
          const groceryItem = await groceryRepository.findOne({
            where:
              { groceryId: groceryId }
          });
          // Check if the grocery item exists
          if (!groceryItem) {
            return res.status(404).json({ error: `Grocery item with ID ${groceryId} not found` });
          }
  
          // Check if there is enough quantity in stock
          if (groceryItem.quantity < quantity) {
            return res.status(400).json({ error: `Insufficient quantity in stock for item ${groceryItem.name}` });
          }

          processedGroceryItems.push({groceryItem:groceryItem,orderedQuantity:quantity});
        }

        for (const processingItem of processedGroceryItems) {
           const currentOrderItem=new Order();
           currentOrderItem.orderId=orderId;
           currentOrderItem.groceryItem.groceryId=processingItem.groceryItem.groceryId;
           currentOrderItem.quantity=processingItem.orderedQuantity;
           currentOrderItem.unitPrice=processingItem.groceryItem.unitprice;
           currentOrderItem.totalPrice=(currentOrderItem.quantity*currentOrderItem.unitPrice);
           totalOrderPrice+=currentOrderItem.totalPrice;
           const orderData = await orderRepository.save(currentOrderItem);
           processingItem.groceryItem.quantity =processingItem.groceryItem.quantity-currentOrderItem.quantity;
           await groceryRepository.save(processingItem.groceryItem);
        }

        const userOrderDetails=new UserOrder();
        userOrderDetails.order.orderId=orderId;
        userOrderDetails.user.userId=userId;
        userOrderDetails.orderTotal=totalOrderPrice;
        userOrderRepository.save(userOrderDetails);

        // Send a success response
        return res.json({ success:true,message: 'Order placed successfully' });
      });
    } catch (error) {
      console.error('Error placing order:', error);
      return res.status(500).json({ success:false,error: 'Internal Server Error' });
    }
  }

  async addUser(req: Request, res: Response){
    try {
      const { email, phone, username, password } = req.body;
      if (!email || !phone || !username || !password) {
        return res.status(400).json({ error: 'Mandatory fields are missing' });
      }
      const userRepository = dataSource.getRepository(User);
      const existingUser = await userRepository.findOne({ where: [{ email:email }, { phone:phone },{username:username}] });
  
      if (existingUser) {
        return res.status(409).json({ error: 'User with the same email or phone already exists' });
      }
      let newUser = new User();
      newUser.email=email;
      newUser.phone=phone;
      newUser.password=password;
      newUser.username=username;
      newUser=await userRepository.save(newUser);
      res.status(201).json({ success:true,message: `User created successfully with Id ${newUser.userId}`});
    } catch (error) {
      console.error('Error during user signup:', error);
      res.status(500).json({success:false,error: 'Internal Server Error' });
    }
  }
}

export default UserController;
