import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  await app.listen(configService.get<number>('PORT') || 3000);
  console.log(
    `Server is running on port: ${configService.get<number>('PORT')}`,
  );
}
bootstrap();
