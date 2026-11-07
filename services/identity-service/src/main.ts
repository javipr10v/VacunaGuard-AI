import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { DomainExceptionFilter } from './infrastructure/http/domain-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors();
  // El puente de desarrollo (loopback) reenvía la IP real del teléfono en X-Forwarded-For
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 'loopback');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(new DomainExceptionFilter());
  const port = process.env.PORT ?? 3001;
  await app.listen(port, '127.0.0.1');
}
bootstrap();
