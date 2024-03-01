import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "grocery_inventory" })
export class GroceryItem {
  @PrimaryGeneratedColumn()
  groceryId: number = 0;

  @Column()
  name: string = "";

  @Column()
  category_name: string = "";

  @Column("decimal", { precision: 10, scale: 2 })
  unitprice: number = 0.0;

  @Column()
  quantity: number = 0;

  @Column({ default: false })
  deleted: boolean = false;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date = new Date();

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at: Date = new Date();
}
