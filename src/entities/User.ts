// src/entities/User.ts

import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "user" })
export class User {
  @PrimaryGeneratedColumn()
  userId: number = 0;

  @Column()
  username: string = "";

  @Column({ unique: true })
  email: string = "";

  @Column({ unique: true })
  phone: string = "";

  @Column()
  password: string = "";

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date = new Date();

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at: Date = new Date();
}
