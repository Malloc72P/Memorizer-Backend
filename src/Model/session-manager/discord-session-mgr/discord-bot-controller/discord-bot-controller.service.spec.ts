import { Test, TestingModule } from '@nestjs/testing';
import { DiscordBotControllerService } from './discord-bot-controller.service';

describe('DiscordBotControllerService', () => {
  let service: DiscordBotControllerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscordBotControllerService],
    }).compile();

    service = module.get<DiscordBotControllerService>(DiscordBotControllerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
