import { Controller, Post, Get, Body, HttpException, HttpStatus } from '@nestjs/common';
import { PlcService } from './plc.service';
import type { PlcConnectionConfig, PlcVariable } from './plc.service';

@Controller('plc')
export class PlcController {
  constructor(private readonly plcService: PlcService) {}

  @Post('connect')
  async connectToPlc(@Body() config: PlcConnectionConfig) {
    try {
      const success = await this.plcService.connectToPlc(config);
      
      if (success) {
        return {
          success: true,
          message: 'Conexión exitosa al PLC',
          timestamp: new Date().toISOString(),
        };
      } else {
        throw new HttpException(
          'No se pudo establecer conexión con el PLC',
          HttpStatus.BAD_REQUEST,
        );
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
        message: 'Desconectado del PLC',
        timestamp: new Date().toISOString(),
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
    try {
      const status = await this.plcService.getConnectionStatus();
      return {
        ...status,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        `Error al obtener estado de conexión: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('variables')
  async readAllVariables() {
    try {
      const variables = await this.plcService.readAllVariables();
      return {
        success: true,
        variables,
        count: variables.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        `Error al leer variables del PLC: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('variables/:name')
  async readVariable(@Body() body: { address: string; dataType: string }) {
    try {
      const value = await this.plcService.readVariable(body.address, body.dataType);
      return {
        success: true,
        address: body.address,
        dataType: body.dataType,
        value,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        `Error al leer variable del PLC: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
