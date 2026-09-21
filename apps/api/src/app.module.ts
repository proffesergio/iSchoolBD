import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { LearnController } from './learn/learn.controller';
import { LearnService } from './learn/learn.service';
import { ProgressController } from './progress/progress.controller';
import { ProgressService } from './progress/progress.service';
import { SupabaseService } from './supabase/supabase.service';
import { CatalogController } from './catalog/catalog.controller';
import { CatalogService } from './catalog/catalog.service';
import { AdminController } from './admin/admin.controller';
import { AdminGuard } from './admin/admin.guard';
import { AuthController } from './auth/auth.controller';
import { StudentAuthService } from './auth/student-auth.service';
import { StudentGuard } from './auth/student.guard';

@Module({
  controllers: [HealthController, LearnController, ProgressController, CatalogController, AdminController, AuthController],
  providers: [LearnService, ProgressService, SupabaseService, CatalogService, AdminGuard, StudentAuthService, StudentGuard],
})
export class AppModule {}
