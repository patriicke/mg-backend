import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReferralDepositTrack } from '../entities/referral-deposit-track.entity';
import { DeepPartial, Repository } from 'typeorm';

@Injectable()
export class ReferralDepositTrackService {
  constructor(
    @InjectRepository(ReferralDepositTrack)
    private repository: Repository<ReferralDepositTrack>
  ) {}

  create(data: DeepPartial<ReferralDepositTrack>) {
    return this.repository.save(data);
  }

  async checkMaximumReferralDepositCount(
    userId: number,
    referralUserId: number
  ) {
    return this.repository.count({
      where: {
        userId,
        referralUserId
      }
    });
  }
}
