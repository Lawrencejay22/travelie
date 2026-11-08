import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import type { JwtPayload } from '../auth.types.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    if (!user || !required.includes(user.role)) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }
    return true;
  }
}