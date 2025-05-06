import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from 'src/auth/decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    ctx: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const { user } = ctx.switchToHttp().getRequest();
    if (!user) throw new BadRequestException('User not found in request');

    const validRoles: string[] = this.reflector.get<string[]>(
      META_ROLES,
      ctx.getHandler(),
    );
    console.log('UserRoleGuard', user);
    console.log(validRoles);


    if (!validRoles || validRoles.length === 0) return true;

    for (const role of validRoles) {
      if (user.roles.includes(role)) return true;
    }

    throw new UnauthorizedException(
      `User ${user.fullname} does not have any of the required roles: ${validRoles}`,
    );
  }
}
