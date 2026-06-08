import { PartialType } from '@nestjs/mapped-types';
import { CreateTvDeviceDto } from './create-tv_device.dto';

export class UpdateTvDeviceDto extends PartialType(CreateTvDeviceDto) {}
