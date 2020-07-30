import { Module } from '@nestjs/common';
import { DaoModule } from '../../DAO/dao.module';
import { DiscordSessionMgrService } from './discord-session-mgr.service';
import { DiscordMsgSenderService } from './discord-msg-sender/discord-msg-sender.service';
import { DiscordBotControllerService } from './discord-bot-controller/discord-bot-controller.service';
import { DiscordReplyMsgMgrService } from './discord-reply-msg-mgr/discord-reply-msg-mgr.service';

@Module({
  imports : [
    DaoModule,
  ],
  providers : [
    /* *************************************************** */
    /* Memorizer Session Service START */
    /* *************************************************** */
    DiscordSessionMgrService,
    DiscordMsgSenderService,
    DiscordBotControllerService,
    DiscordReplyMsgMgrService,
  ],
  exports : [
    DiscordSessionMgrService,
    DiscordMsgSenderService,
    DiscordReplyMsgMgrService,
  ],
})
export class DiscordSessionMgrModule {}
