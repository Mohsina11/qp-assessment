import { Request, Response } from "express";
import { MoreThan, getRepository } from "typeorm";
import { GroceryItem } from "../entities/GroceryItem";
import { Order } from "../entities/Order";
import { UserOrder } from "../entities/UserOrderMapping";
import { User } from "../entities/User";
import dataSource from "../db/dataSourceLocal";
import { v4 as uuidv4 } from "uuid";

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
      console.error("Error viewing grocery items:", error);
      return res
        .status(500)
        .json({ success: false, error: "Internal Server Error" });
    }
  }

  async bookItems(req: Request, res: Response) {
    try {
      const userId: number = parseInt(req.params.userId);
      const { items } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Invalid order details" });
      }
      const queryRunner = dataSource.createQueryRunner();
      const groceryRepository = queryRunner.manager.getRepository(GroceryItem);
      const userOrderRepository = queryRunner.manager.getRepository(UserOrder);
      const orderRepository = queryRunner.manager.getRepository(Order);
      await queryRunner.startTransaction();
      let transactionCompleted = true,
        errormessage: string = "",
        errorCode: number = 500;
      try {
        let totalOrderPrice: number = 0.0;
        const processedGroceryItems: ProcessedGroceryItem[] = [];
        for (const item of items) {
          const { groceryId, quantity } = item;
          if (!groceryId || !quantity || quantity <= 0) {
            errorCode = 400;
            errormessage = "Invalid item details in the order";
            throw new Error(errormessage);
          }
          const groceryItem = await groceryRepository.findOne({
            where: { groceryId: groceryId },
          });
          if (!groceryItem) {
            errorCode = 404;
            errormessage = `Grocery item with ID ${groceryId} not found`;
            throw new Error(errormessage);
          }
          if (groceryItem.quantity < quantity) {
            errorCode = 400;
            errormessage = `Insufficient quantity in stock for item ${groceryItem.name}`;
            throw new Error(errormessage);
          }
          totalOrderPrice += groceryItem.quantity * groceryItem.unitprice;
          processedGroceryItems.push({
            groceryItem: groceryItem,
            orderedQuantity: quantity,
          });
        }
        const orderId = uuidv4();
        let userOrderDetails = new UserOrder();
        userOrderDetails.orderId = orderId;
        userOrderDetails.user.userId = userId;
        userOrderDetails.orderTotal = totalOrderPrice;
        userOrderDetails = await userOrderRepository.save(userOrderDetails);

        for (const processingItem of processedGroceryItems) {
          const currentOrderItem = new Order();
          currentOrderItem.order_mapping_Id = orderId;
          currentOrderItem.userOrder.orderId = orderId;
          currentOrderItem.groceryId = processingItem.groceryItem.groceryId;
          currentOrderItem.groceryItem.groceryId =
            processingItem.groceryItem.groceryId;
          currentOrderItem.quantity = processingItem.orderedQuantity;
          currentOrderItem.unitPrice = processingItem.groceryItem.unitprice;
          currentOrderItem.totalPrice =
            currentOrderItem.quantity * currentOrderItem.unitPrice;
          await orderRepository.save(currentOrderItem);
          processingItem.groceryItem.quantity =
            processingItem.groceryItem.quantity - currentOrderItem.quantity;
          await groceryRepository.save(processingItem.groceryItem);
        }
        await queryRunner.commitTransaction();
      } catch (err) {
        transactionCompleted = false;
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }

      if (transactionCompleted) {
        return res
          .status(200)
          .json({ success: true, message: "Order placed successfully" });
      } else {
        return res
          .status(errorCode)
          .json({ success: false, error: errormessage });
      }
    } catch (error) {
      console.error("Error placing order:", error);
      return res
        .status(500)
        .json({ success: false, error: "Internal Server Error" });
    }
  }

  async addUser(req: Request, res: Response) {
    try {
      const { email, phone, username, password } = req.body;
      if (!email || !phone || !username || !password) {
        return res.status(400).json({ error: "Mandatory fields are missing" });
      }
      const userRepository = dataSource.getRepository(User);
      const existingUser = await userRepository.findOne({
        where: [{ email: email }, { phone: phone }, { username: username }],
      });

      if (existingUser) {
        return res
          .status(409)
          .json({ error: "User with the same email or phone already exists" });
      }
      let newUser = new User();
      newUser.email = email;
      newUser.phone = phone;
      newUser.password = password;
      newUser.username = username;
      newUser = await userRepository.save(newUser);
      res
        .status(201)
        .json({
          success: true,
          message: `User created successfully with Id ${newUser.userId}`,
        });
    } catch (error) {
      console.error("Error during user signup:", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
}

export default UserController;
