import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

/**
 * Shared-secret admin guard. The admin panel sends `x-admin-key`.
 * Fail-closed: missing ADMIN_API_KEY env denies everything with a
 * setup hint instead of silently opening the panel.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expected = process.env.ADMIN_API_KEY;
    if (!expected) {
      throw new ForbiddenException(
        'Admin is disabled: set ADMIN_API_KEY on the API project (see docs/ADMIN.md).',
      );
    }
    const req = context.switchToHttp().getRequest<{ headers: Record<string, unknown> }>();
    const got = req.headers['x-admin-key'];
    if (got !== expected) throw new ForbiddenException('Invalid admin key.');
    return true;
  }
}
