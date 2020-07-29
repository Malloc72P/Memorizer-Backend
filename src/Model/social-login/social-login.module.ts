import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { DaoModule } from '../DAO/dao.module';
import { DiscordSessionMgrModule } from '../session-manager/discord-session-mgr/discord-session-mgr.module';
import { GoogleStrategyService } from './google-strategy/google-strategy.service';
import { JwtStrategyService } from './jwt-strategy/jwt-strategy.service';
import { AuthService } from './auth/auth.service';

@Module({
  imports : [
    PassportModule,
    DaoModule,
  ],
  providers : [
    /* *************************************************** */
    /* Auth Service START */
    /* *************************************************** */
    GoogleStrategyService,
    JwtStrategyService,
    AuthService,
  ],
  exports : [
    AuthService,
  ],
})
export class SocialLoginModule {}
