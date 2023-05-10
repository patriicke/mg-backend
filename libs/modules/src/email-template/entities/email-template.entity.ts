import { Column, Entity, Index } from 'typeorm';
import { CustomBaseEntity } from '@app/common-module';

@Entity({
  name: 'email_templates'
})
export class EmailTemplateEntity extends CustomBaseEntity {
  @Column()
  @Index({
    unique: true
  })
  title: string;

  @Column()
  code: string;

  @Column()
  sender: string;

  @Column()
  subject: string;

  @Column()
  target: string;

  @Column()
  body: string;

  @Column()
  isDefault: boolean;
}
