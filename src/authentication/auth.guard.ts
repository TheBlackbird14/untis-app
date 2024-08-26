import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    let token: string;

    try {
      token = request.cookies['authToken'];
    } catch (e) {
      throw new UnauthorizedException('No auth token found');
    }

    const username = request.cookies['username'];

    const user = await this.authService.validateUser(token, username);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    request.cookies['username'] = user.username;
    request.cookies['password'] = user.password;

    return true; // Allow access
  }
}
