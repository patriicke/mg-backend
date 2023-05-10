import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'default_profile_image'
})
export class DefaultProfileImage extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  image: string;

  @Column()
  status: boolean;
}
