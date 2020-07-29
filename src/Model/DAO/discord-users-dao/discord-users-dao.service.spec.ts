import { Test, TestingModule } from '@nestjs/testing';
import { DiscordUsersDaoService } from './discord-users-dao.service';

describe('DiscordChannelDaoService', () => {
  let service: DiscordUsersDaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscordUsersDaoService],
    }).compile();

    service = module.get<DiscordUsersDaoService>(DiscordUsersDaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
