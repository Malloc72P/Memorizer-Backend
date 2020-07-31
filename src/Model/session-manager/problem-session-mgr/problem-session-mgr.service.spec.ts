import { Test, TestingModule } from '@nestjs/testing';
import { ProblemSessionMgrService } from './problem-session-mgr.service';

describe('ProblemSessionMgrService', () => {
  let service: ProblemSessionMgrService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProblemSessionMgrService],
    }).compile();

    service = module.get<ProblemSessionMgrService>(ProblemSessionMgrService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
