import { SetMetadata } from '@nestjs/common';
import type { Rol } from '../../domain/value-objects/rol.vo';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);
