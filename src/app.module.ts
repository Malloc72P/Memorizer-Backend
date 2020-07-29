import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtStrategyService } from './Model/social-login/jwt-strategy/jwt-strategy.service';
import { AuthService } from './Model/social-login/auth/auth.service';
import { GoogleStrategyService } from './Model/social-login/google-strategy/google-strategy.service';
import { PassportModule } from '@nestjs/passport';
import { AuthCallbackController } from './Controller/auth-callback/auth-callback.controller';
import { ProblemController } from './Controller/problem-controller/problem.controller';
import { SectionController } from './Controller/section-controller/section.controller';
import { ErrorHandlerService } from './Model/error-handler/error-handler.service';
import { DiscordSessionMgrService } from './Model/session-manager/discord-session-mgr/discord-session-mgr.service';
import { DiscordSessionController } from './Controller/discord-session/discord-session.controller';
import { DaoModule } from './Model/DAO/dao.module';
import { DiscordSessionMgrModule } from './Model/session-manager/discord-session-mgr/discord-session-mgr.module';
import { SocialLoginModule } from './Model/social-login/social-login.module';
import { ErrorHandlerModule } from './Model/error-handler/error-handler.module';

@Module({
  imports: [
    DaoModule,
    DiscordSessionMgrModule,
    SocialLoginModule,
    ErrorHandlerModule
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
  ],
})
export class AppModule {}
