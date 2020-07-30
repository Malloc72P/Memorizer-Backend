import { Test, TestingModule } from '@nestjs/testing';
import { DiscordMsgSenderService } from './discord-msg-sender.service';

describe('DiscordMsgSenderService', () => {
  let service: DiscordMsgSenderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscordMsgSenderService],
    }).compile();

    service = module.get<DiscordMsgSenderService>(DiscordMsgSenderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
