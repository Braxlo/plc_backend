import { Module } from '@nestjs/common';
import { PlcService } from './plc.service';
import { PlcController } from './plc.controller';

@Module({
  controllers: [PlcController],
  providers: [PlcService],
  exports: [PlcService],
})
export class PlcModule {}
