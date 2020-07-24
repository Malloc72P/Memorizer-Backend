import { Test, TestingModule } from '@nestjs/testing';
import { ProblemDaoService } from './problem-dao.service';

describe('ProblemDaoService', () => {
  let service: ProblemDaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProblemDaoService],
    }).compile();

    service = module.get<ProblemDaoService>(ProblemDaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
