import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistItemsController } from './playlist_items.controller';
import { PlaylistItemsService } from './playlist_items.service';

describe('PlaylistItemsController', () => {
  let controller: PlaylistItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaylistItemsController],
      providers: [PlaylistItemsService],
    }).compile();

    controller = module.get<PlaylistItemsController>(PlaylistItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
