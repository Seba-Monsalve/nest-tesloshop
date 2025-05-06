import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../interfaces';
export const META_ROLES = ['admin', 'user'];

export const RoleProtectedDecorator = (...args: ValidRoles[]) =>
  SetMetadata(META_ROLES, args);
