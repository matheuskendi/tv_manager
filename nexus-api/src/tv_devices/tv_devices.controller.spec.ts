import { Test, TestingModule } from '@nestjs/testing';
import { TvDevicesController } from './tv_devices.controller';
import { TvDevicesService } from './tv_devices.service';

describe('TvDevicesController', () => {
  let controller: TvDevicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TvDevicesController],
      providers: [TvDevicesService],
    }).compile();

    controller = module.get<TvDevicesController>(TvDevicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
