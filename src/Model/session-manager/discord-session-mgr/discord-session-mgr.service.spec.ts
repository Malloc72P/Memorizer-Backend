import { Test, TestingModule } from '@nestjs/testing';
import { DiscordSessionMgrService } from './discord-session-mgr.service';

describe('DiscordSessionMgrService', () => {
  let service: DiscordSessionMgrService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscordSessionMgrService],
    }).compile();

    service = module.get<DiscordSessionMgrService>(DiscordSessionMgrService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
