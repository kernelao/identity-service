import { Module } from '@nestjs/common';
import { HttpModule } from '@/interfaces/http/http.module';

@Module({
  imports: [HttpModule],
})
export class AppModule {}
