import { Test, TestingModule } from '@nestjs/testing';
import { DiscordSessionController } from './discord-session.controller';

describe('DiscordSession Controller', () => {
  let controller: DiscordSessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscordSessionController],
    }).compile();

    controller = module.get<DiscordSessionController>(DiscordSessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
