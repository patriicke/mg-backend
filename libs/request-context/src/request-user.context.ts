import { RequestContext } from './request-context.model';

interface User {
  id: number;
}
export class RequestUserContext extends RequestContext {
  user: User;
}
