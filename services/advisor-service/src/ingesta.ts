import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IngestaDocumentosUseCase } from './application/use-cases/ingesta-documentos.use-case';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });
  try {
    const ingesta = app.get(IngestaDocumentosUseCase);
    await ingesta.ejecutar();
  } finally {
    await app.close();
  }
}

void bootstrap();
