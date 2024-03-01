// src/entities/Order.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { GroceryItem } from "./GroceryItem";

@Entity({ name: "order_details" })
export class Order {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column()
  orderId: string = "";

  @ManyToOne(() => GroceryItem, { eager: true })
  @JoinColumn({ name: "groceryId" })
  groceryItem: GroceryItem = new GroceryItem();

  @Column()
  quantity: number = 0;

  @Column("decimal", { precision: 10, scale: 2 })
  unitPrice: number = 0.0;

  @Column("decimal", { precision: 10, scale: 2 })
  totalPrice: number = 0.0;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  ordered_at: Date = new Date();

  @Column({ type: "timestamp" })
  delivered_at: Date = new Date();

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at: Date = new Date();
}
