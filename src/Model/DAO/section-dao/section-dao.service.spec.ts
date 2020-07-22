import { Test, TestingModule } from '@nestjs/testing';
import { SectionDaoService } from './section-dao.service';

describe('SectionDaoService', () => {
  let service: SectionDaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SectionDaoService],
    }).compile();

    service = module.get<SectionDaoService>(SectionDaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
