import { Module } from '@nestjs/common';
import { DaoModule } from '../../DAO/dao.module';
import { DiscordSessionMgrService } from './discord-session-mgr.service';

@Module({
  imports : [
    DaoModule,
  ],
  providers : [
    /* *************************************************** */
    /* Memorizer Session Service START */
    /* *************************************************** */
    DiscordSessionMgrService,
  ],
  exports : [
    DiscordSessionMgrService
  ],
})
export class DiscordSessionMgrModule {}
