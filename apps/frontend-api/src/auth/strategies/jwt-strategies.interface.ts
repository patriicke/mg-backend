import { FrontendUser } from '@app/modules/frontend-user';
export interface JwtStrategyInterface {
  validate(payload: Record<string, string>): Promise<FrontendUser>;
}
