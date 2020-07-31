import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthCallbackController } from './Controller/auth-callback/auth-callback.controller';
import { ProblemController } from './Controller/problem-controller/problem.controller';
import { SectionController } from './Controller/section-controller/section.controller';
import { DiscordSessionController } from './Controller/discord-session/discord-session.controller';
import { DaoModule } from './Model/DAO/dao.module';
import { DiscordSessionMgrModule } from './Model/session-manager/discord-session-mgr/discord-session-mgr.module';
import { SocialLoginModule } from './Model/social-login/social-login.module';
import { ErrorHandlerModule } from './Model/error-handler/error-handler.module';
import { ProblemSessionMgrModule } from './Model/session-manager/problem-session-mgr/problem-session-mgr.module';

@Module({
  imports: [
    DaoModule,
    DiscordSessionMgrModule,
    SocialLoginModule,
    ErrorHandlerModule,
    ProblemSessionMgrModule,
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
