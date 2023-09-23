import {
  ClassSerializerInterceptor,
  Controller,
  Post,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { User } from './entities/user.entity';
import { AuthGuardLocal } from './auth-guard.local';
import { AuthGuardJwt } from './auth-guard.jwt';

@Controller('auth')
@SerializeOptions({ strategy: 'excludeAll' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  // @UseGuards(AuthGuard('local'))
  @UseGuards(AuthGuardLocal) // default name for local strategy is local and here we are using guard which tells whether to handl the request or not. Use the same name here provided in local.strategy's PassportStrategy(Strategy, "local")
  // this guard is using the validate function from local.strategy if the auth succeeds the function will run else exception will be thrown
  // async login(@Request() request) {
  async login(@CurrentUser() user: User) {
    return {
      // userId: request.user.id,
      // token: this.authService.getTokenForUser(request.user),
      userId: user.id,
      token: this.authService.getTokenForUser(user),
    };
  }

  @Post('profile')
  // @UseGuards(AuthGuard('jwt'))
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  // async getProfile(@Request() request) {
  async getProfile(@CurrentUser() user: User) {
    // return request.user;
    return user;
  }
}
