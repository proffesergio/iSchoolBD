import { Controller, Get, Post, Body, Query, BadRequestException } from '@nestjs/common';
import { IsInt, IsString, Min, Max } from 'class-validator';
import { ProgressService } from './progress.service';

class UpsertDto {
  @IsString() user_id!: string;
  @IsString() topic!: string;
  @IsInt() @Min(0) @Max(500) xp!: number;
  @IsInt() @Min(0) @Max(100) progress_percentage!: number;
}

@Controller('progress')
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Get()
  list(@Query('user_id') user_id: string) {
    if (!user_id) throw new BadRequestException('user_id query required');
    return this.progress.list(user_id);
  }

  @Get('summary')
  summary(@Query('user_id') user_id: string) {
    if (!user_id) throw new BadRequestException('user_id query required');
    return this.progress.summary(user_id);
  }

  @Post()
  upsert(@Body() dto: UpsertDto) {
    return this.progress.upsert(dto.user_id, dto.topic, dto.xp, dto.progress_percentage);
  }
}
