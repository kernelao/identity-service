import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { AllExceptionsFilter } from '@/interfaces/http/filters/all-exceptions.filter';
import { AppErrorFilter } from '@/interfaces/http/filters/AppError.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalFilters(new AppErrorFilter());
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
