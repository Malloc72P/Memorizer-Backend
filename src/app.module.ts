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
import { SectionSchema } from './Model/DTO/SectionDto/section.schema';
import { ProblemSchema } from './Model/DTO/ProblemDto/problem.schema';
import { ProblemDaoService } from './Model/DAO/problem-dao/problem-dao.service';
import { ProblemController } from './Controller/problem-controller/problem.controller';
import { SectionController } from './Controller/section-controller/section.controller';
import { SectionDaoService } from './Model/DAO/section-dao/section-dao.service';
import { ErrorHandlerService } from './Model/error-handler/error-handler.service';
import { DiscordSessionMgrService } from './Model/session-manager/discord-session-mgr/discord-session-mgr.service';
import { DiscordUsersSchema } from './Model/DTO/DiscordUsersDto/discord-users.schema';
import { DiscordUsersDaoService } from './Model/DAO/discord-users-dao/discord-users-dao.service';
import { DiscordSessionController } from './Controller/discord-session/discord-session.controller';

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
        {
          name: "SECTION_MODEL",
          schema: SectionSchema
        },
        {
          name: "PROBLEM_MODEL",
          schema: ProblemSchema
        },
        {
          name: "DISCORD_USERS_MODEL",
          schema: DiscordUsersSchema
        },
      ]),
  ],
  controllers: [
    AppController,
    AuthCallbackController,
    SectionController,
    ProblemController,
    DiscordSessionController
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
    SectionDaoService,
    ProblemDaoService,
    DiscordUsersDaoService,
    /* *************************************************** */
    /* Handler Service START */
    /* *************************************************** */
    ErrorHandlerService,
    /* *************************************************** */
    /* Memorizer Session Service START */
    /* *************************************************** */
    DiscordSessionMgrService,
  ],
})
export class AppModule {}
