import { Test, TestingModule } from '@nestjs/testing';
import { DiscordReplyMsgMgrService } from './discord-reply-msg-mgr.service';

describe('DiscordReplyMsgMgrService', () => {
  let service: DiscordReplyMsgMgrService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscordReplyMsgMgrService],
    }).compile();

    service = module.get<DiscordReplyMsgMgrService>(DiscordReplyMsgMgrService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
