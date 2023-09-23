import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UsersController } from './users.controller';

@Module({
  imports: [
    // to get the env variable either we can initialize the configModule or can use the registerAsync
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.AUTH_SECRET,
        signOptions: {
          expiresIn: '60m',
        },
      }),
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [LocalStrategy, AuthService, JwtStrategy],
  controllers: [AuthController, UsersController],
})
export class AuthModule {}
