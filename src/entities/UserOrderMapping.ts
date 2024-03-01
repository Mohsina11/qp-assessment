// src/entities/UserOrder.ts

import { Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, PrimaryColumn, Column } from 'typeorm';
import { User } from './User';
import { Order } from './Order';

@Entity({ name: 'user_order_mapping' })
export class UserOrder {

  @PrimaryColumn({ type: 'uuid', insert: false, select: false, update: false })
  id: number=0;
    
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User=new User();

  @ManyToOne(() => Order, { eager: true })
  @JoinColumn({ name: 'orderId' })
  order: Order=new Order();

  @Column('decimal', { precision: 10, scale: 2 })
  orderTotal: number=0.0;
}
