import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { StudentAuthService } from './student-auth.service';

@Injectable()
export class StudentGuard implements CanActivate {
  constructor(private readonly auth: StudentAuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{
      headers: Record<string, unknown>;
      studentId?: string;
    }>();
    const header = req.headers['authorization'];
    if (typeof header !== 'string' || !header.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Bearer token. Log in at /login.');
    }
    const studentId = this.auth.verifyToken(header.slice('Bearer '.length).trim());
    if (!studentId) throw new UnauthorizedException('Invalid or expired login. Please log in again.');
    req.studentId = studentId;
    return true;
  }
}
