import { Column, Entity } from 'typeorm';
import { CustomBaseEntity } from '@app/common-module';

@Entity({
  name: 'referral_deposit_track'
})
export class ReferralDepositTrack extends CustomBaseEntity {
  @Column()
  userId: number;

  @Column()
  referralUserId: number;
}
