import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { User } from './User';

@Entity({ name: 'user_orders' })
export class UserOrder {
  @PrimaryColumn()
  orderId:string='';

  @Column()
  userId: number=0;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  orderTotal: number=0.0;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  ordered_at: Date=new Date();

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  delivered_at: Date=new Date();

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP',onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date=new Date();

  @Column({
    type: 'enum',
    enum: ['pending', 'completed'],
    default: 'pending',
  })
  status: 'pending' | 'completed'='pending';

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User=new User();
}
