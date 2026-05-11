import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const user = await this.auth.requireUser(req);
    (req as any).user = user;
    
    if (!user.isAdmin) {
      throw new ForbiddenException({ message: 'Admin access required' });
    }
    
    return true;
  }
}
