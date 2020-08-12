import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import { ServerSetting } from './Config/server-setting';

async function bootstrap() {
  const httpsOptions = {
    ca: fs.readFileSync('ssl/fullchain.pem'),
    key: fs.readFileSync('ssl/privkey.pem'),
    cert: fs.readFileSync('ssl/cert.pem'),
  };

  const app = await NestFactory.create(AppModule, { httpsOptions });

  app.enableCors();
  await app.listen(Number(ServerSetting.nestPort.slice(1, ServerSetting.nestPort.length)));
}
bootstrap().catch(reason => {
  console.error("bootstrap : ", reason);
});
