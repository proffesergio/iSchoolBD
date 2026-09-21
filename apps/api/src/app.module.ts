import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { LearnController } from './learn/learn.controller';
import { LearnService } from './learn/learn.service';
import { ProgressController } from './progress/progress.controller';
import { ProgressService } from './progress/progress.service';
import { SupabaseService } from './supabase/supabase.service';

@Module({
  controllers: [HealthController, LearnController, ProgressController],
  providers: [LearnService, ProgressService, SupabaseService],
})
export class AppModule {}
