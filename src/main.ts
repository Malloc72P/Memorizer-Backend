import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import { ServerSetting } from './Config/server-setting';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('ssl/server.key.pem'),
    cert: fs.readFileSync('ssl/server.crt.pem'),
  };

  const app = await NestFactory.create(AppModule, { httpsOptions });

  app.enableCors();
  await app.listen(Number(ServerSetting.nestPort.slice(1, ServerSetting.nestPort.length)));
}
bootstrap().catch(reason => {
  console.error("bootstrap : ", reason);
});
