import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PlcModule } from './plc/plc.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PlcModule,
  ],
})
export class AppModule {}