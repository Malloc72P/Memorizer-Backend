import { Module } from '@nestjs/common';
import { ProblemSessionMgrService } from './problem-session-mgr.service';
import { DaoModule } from '../../DAO/dao.module';
import { DiscordSessionMgrModule } from '../discord-session-mgr/discord-session-mgr.module';

@Module({
  imports : [
    DaoModule,
    DiscordSessionMgrModule
  ],
  providers: [ProblemSessionMgrService],
  exports : [ProblemSessionMgrService],
})
export class ProblemSessionMgrModule {}
