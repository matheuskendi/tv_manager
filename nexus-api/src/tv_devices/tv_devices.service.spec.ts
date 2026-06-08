import { Test, TestingModule } from '@nestjs/testing';
import { TvDevicesService } from './tv_devices.service';

describe('TvDevicesService', () => {
  let service: TvDevicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TvDevicesService],
    }).compile();

    service = module.get<TvDevicesService>(TvDevicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
