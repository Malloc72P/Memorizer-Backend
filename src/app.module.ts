import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtStrategyService } from './Model/SocialLogin/jwt-strategy/jwt-strategy.service';
import { AuthService } from './Model/SocialLogin/auth/auth.service';
import { GoogleStrategyService } from './Model/SocialLogin/google-strategy/google-strategy.service';
import { UserDaoService } from './Model/DAO/user-dao/user-dao.service';
import { UsersSchema } from './Model/DTO/UserDto/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ServerSetting } from './Config/server-setting';
import { AuthCallbackController } from './Controller/auth-callback/auth-callback.controller';

@Module({
  imports: [
    PassportModule,
    MongooseModule.forRoot(ServerSetting.dbUrl,
      {
        useNewUrlParser: true,
        useUnifiedTopology : true,
      }),
    MongooseModule.forFeature(
      [
        {
          name: "USERS_MODEL",
          schema: UsersSchema
        },
      ]),
  ],
  controllers: [
    AppController,
    AuthCallbackController
  ],
  providers: [
    AppService,

    /* *************************************************** */
    /* Auth Service START */
    /* *************************************************** */
    GoogleStrategyService,
    JwtStrategyService,
    AuthService,
    /* *************************************************** */
    /* Data Access Object START */
    /* *************************************************** */
    UserDaoService,
  ],
})
export class AppModule {}
