import { Controller, Post, Get, Body, HttpException, HttpStatus } from '@nestjs/common';
import { PlcService, PlcData } from './plc.service';
import { ConnectPlcDto } from './dto/connect-plc.dto';

@Controller('plc')
export class PlcController {
  constructor(private readonly plcService: PlcService) {}

  @Post('connect')
  async connectToPlc(@Body() connectDto: ConnectPlcDto) {
    try {
      const { ip, rack = 0, slot = 1 } = connectDto;
      
      if (!ip) {
        throw new HttpException('La IP del PLC es requerida', HttpStatus.BAD_REQUEST);
      }

      const isConnected = await this.plcService.connectToPlc(ip, rack, slot);
      
      if (isConnected) {
        return {
          success: true,
          message: `Conectado exitosamente al PLC en ${ip}`,
          ip,
          rack,
          slot,
        };
      } else {
        throw new HttpException('No se pudo conectar al PLC', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      throw new HttpException(
        `Error al conectar al PLC: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('disconnect')
  async disconnectFromPlc() {
    try {
      await this.plcService.disconnectFromPlc();
      return {
        success: true,
        message: 'Desconectado exitosamente del PLC',
      };
    } catch (error) {
      throw new HttpException(
        `Error al desconectar del PLC: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('status')
  async getConnectionStatus() {
    const isConnected = this.plcService.getConnectionStatus();
    return {
      connected: isConnected,
      message: isConnected ? 'Conectado al PLC' : 'No conectado al PLC',
    };
  }

  @Get('variables')
  async readPlcVariables(): Promise<PlcData> {
    try {
      const variables = await this.plcService.readPlcVariables();
      return variables;
    } catch (error) {
      throw new HttpException(
        `Error al leer variables del PLC: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('info')
  async getPlcInfo() {
    try {
      const info = await this.plcService.getPlcInfo();
      return info;
    } catch (error) {
      throw new HttpException(
        `Error al obtener información del PLC: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
