import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { GroceryItem } from "../entities/GroceryItem";
import dataSource from "../db/dataSourceLocal";

class AdminController {
  async addItem(req: Request, res: Response) {
    try {
      const { name, unitprice } = req.body;
      if (!name || !unitprice) {
        return res
          .status(400)
          .json({ success: false, error: "Name and unitprice are required to add grocery item" });
      }
      const newGrocery:GroceryItem = new GroceryItem();
      newGrocery.name = name;
      newGrocery.unitprice = unitprice;
      newGrocery.quantity = req.body.quantity || 0;
      const groceryRepository = dataSource.getRepository(GroceryItem);
      const groceryData = await groceryRepository.save(newGrocery);
      return res.status(201).json({
        success: true,
        message: "Grocery item added successfully",
        data: {
          id: groceryData?.groceryId,
        },
      });
    } catch (error) {
      console.error("Error adding grocery item:", error);
      return res
        .status(500)
        .json({ success: false, error: "Internal Server Error" });
    }
  }

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

  async removeItem(req: Request, res: Response) {
    try {
      const groceryId: number = parseInt(req.params.groceryId, 10);
      if (isNaN(groceryId) || groceryId <= 0) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid grocery item id" });
      }

      const groceryRepository = dataSource.getRepository(GroceryItem);
      const groceryItemToRemove = await groceryRepository.findOne({
        where: { groceryId: groceryId },
      });

      if (!groceryItemToRemove) {
        return res
          .status(404)
          .json({ success: false, error: "Grocery item not found" });
      }

      groceryItemToRemove.deleted = true;

      await groceryRepository.save(groceryItemToRemove);

      return res.json({
        success: true,
        message: "Grocery item removed successfully",
      });
    } catch (error) {
      console.error("Error removing grocery item:", error);

      return res.status(500).json({ success: false,error: "Internal Server Error" });
    }
  }

  async updateItem(req: Request, res: Response) {
    try {
      const groceryId: number = parseInt(req.params.groceryId, 10);
      if (isNaN(groceryId) || groceryId < 0) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid grocery Id" });
      }
      const { price } = req.body;

      if (!price) {
        return res.status(400).json({ success: false,error: "Missing required parameters" });
      }

      const groceryRepository = dataSource.getRepository(GroceryItem);
      const groceryItemToUpdate = await groceryRepository.findOne({
        where: { groceryId: groceryId, deleted: false },
      });

      if (!groceryItemToUpdate) {
        return res.status(404).json({ success: false,error: "Grocery item not found" });
      }

      groceryItemToUpdate.unitprice = price;

      await groceryRepository.save(groceryItemToUpdate);
      return res.json({
        success: true,
        message: "Grocery item updated successfully",
      });
    } catch (error) {
      console.error("Error updating grocery item:", error);
      return res
        .status(500)
        .json({ success: false, error: "Internal Server Error" });
    }
  }

  async manageInventory(req: Request, res: Response) {
    const groceryId: number = parseInt(req.params.groceryId, 10);
    if (isNaN(groceryId) || groceryId < 0) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid grocery Id" });
    }
    const { quantity } = req.body;
    if (!quantity) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required parameters" });
    }
    const groceryRepository = dataSource.getRepository(GroceryItem);
    let groceryItemToUpdate = await groceryRepository.findOne({
      where: { groceryId: groceryId, deleted: false },
    });
    if (!groceryItemToUpdate) {
      return res
        .status(404)
        .json({ success: false, error: "Grocery item not found" });
    }
    groceryItemToUpdate.quantity = groceryItemToUpdate?.quantity + quantity;
    groceryItemToUpdate = await groceryRepository.save(groceryItemToUpdate);
    return res.json({
      success: true,
      message: "Grocery item updated successfully",
      data: {
        id: groceryItemToUpdate.groceryId,
        quantity: groceryItemToUpdate.quantity,
      },
    });
  }
}

export default AdminController;
