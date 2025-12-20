import { Module } from '@nestjs/common';
import { HealthController } from '@/interfaces/http/health.controller';

@Module({
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
