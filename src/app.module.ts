import { Module } from '@nestjs/common';
import { PlcModule } from './plc/plc.module';

@Module({
  imports: [PlcModule],
})
export class AppModule {}