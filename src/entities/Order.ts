import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { GroceryItem } from "./GroceryItem";
import { UserOrder } from "./UserOrderMapping";

@Entity({ name: "order_details" })
export class Order {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column()
  order_mapping_Id: string = "";

  @Column()
  groceryId: number = 0;

  @Column()
  quantity: number = 0;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  unitPrice: number = 0.0;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  totalPrice: number = 0.0;

  @ManyToOne(() => UserOrder)
  @JoinColumn({ name: "order_mapping_Id" })
  userOrder: UserOrder = new UserOrder();

  @ManyToOne(() => GroceryItem)
  @JoinColumn({ name: "groceryId" })
  groceryItem: GroceryItem = new GroceryItem();
}
