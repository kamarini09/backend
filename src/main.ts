import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // ✅ Allow requests from React Native
  await app.listen(3000);
}

bootstrap();
