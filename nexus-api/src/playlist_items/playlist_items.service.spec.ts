import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistItemsService } from './playlist_items.service';

describe('PlaylistItemsService', () => {
  let service: PlaylistItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlaylistItemsService],
    }).compile();

    service = module.get<PlaylistItemsService>(PlaylistItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
