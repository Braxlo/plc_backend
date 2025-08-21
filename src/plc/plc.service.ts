import { Injectable, Logger } from '@nestjs/common';
import * as snap7 from 'node-snap7';

export interface PlcVariable {
  name: string;
  address: string;
  type: 'bool' | 'int' | 'real' | 'string';
  comment: string;
}

export interface PlcData {
  fechaHora: string;
  vb: number;
  cb: number;
  sw: number;
  et: number;
  pt: number;
  vs: number;
  cs: number;
}

@Injectable()
export class PlcService {
  private readonly logger = new Logger(PlcService.name);
  private client: snap7.S7Client;
  private isConnected = false;

  constructor() {
    this.client = new snap7.S7Client();
  }

  async connectToPlc(ip: string, rack: number = 0, slot: number = 1): Promise<boolean> {
    try {
      this.logger.log(`Intentando conectar al PLC en ${ip}`);
      
      const result = await this.client.ConnectTo(ip, rack, slot);
      
      if (result === 0) {
        this.isConnected = true;
        this.logger.log(`Conectado exitosamente al PLC en ${ip}`);
        return true;
      } else {
        this.logger.error(`Error al conectar al PLC: ${result}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Error de conexión: ${error.message}`);
      return false;
    }
  }

  async disconnectFromPlc(): Promise<void> {
    if (this.isConnected) {
      await this.client.Disconnect();
      this.isConnected = false;
      this.logger.log('Desconectado del PLC');
    }
  }

  async readPlcVariables(): Promise<PlcData> {
    if (!this.isConnected) {
      throw new Error('No hay conexión activa con el PLC');
    }

    try {
      // Leer fecha y hora (DB51.DBX164.0 - string de 8 bytes)
      const fechaHoraBuffer = await this.client.DBRead(51, 164, 8);
      const fechaHora = this.bufferToString(fechaHoraBuffer);

      // Leer VB (DB1.DBD24 - real de 4 bytes)
      const vbBuffer = await this.client.DBRead(1, 24, 4);
      const vb = this.bufferToReal(vbBuffer);

      // Leer CB (DB1.DBW28 - int de 2 bytes)
      const cbBuffer = await this.client.DBRead(1, 28, 2);
      const cb = this.bufferToInt(cbBuffer);

      // Leer SW (DB1.DBW50 - int de 2 bytes)
      const swBuffer = await this.client.DBRead(1, 50, 2);
      const sw = this.bufferToInt(swBuffer);

      // Leer ET (DB1.DBW16 - int de 2 bytes)
      const etBuffer = await this.client.DBRead(1, 16, 2);
      const et = this.bufferToInt(etBuffer);

      // Leer PT (DB1.DBW18 - int de 2 bytes)
      const ptBuffer = await this.client.DBRead(1, 18, 2);
      const pt = this.bufferToInt(ptBuffer);

      // Leer VS (DB1.DBD36 - real de 4 bytes)
      const vsBuffer = await this.client.DBRead(1, 36, 4);
      const vs = this.bufferToReal(vsBuffer);

      // Leer CS (DB1.DBW34 - int de 2 bytes)
      const csBuffer = await this.client.DBRead(1, 34, 2);
      const cs = this.bufferToInt(csBuffer);

      return {
        fechaHora,
        vb,
        cb,
        sw,
        et,
        pt,
        vs,
        cs,
      };
    } catch (error) {
      this.logger.error(`Error al leer variables del PLC: ${error.message}`);
      throw error;
    }
  }

  private bufferToString(buffer: Buffer): string {
    return buffer.toString('utf8').replace(/\0/g, '');
  }

  private bufferToInt(buffer: Buffer): number {
    return buffer.readInt16LE(0);
  }

  private bufferToReal(buffer: Buffer): number {
    return buffer.readFloatLE(0);
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  async getPlcInfo(): Promise<any> {
    if (!this.isConnected) {
      throw new Error('No hay conexión activa con el PLC');
    }

    try {
      const orderCode = await this.client.GetOrderCode();
      const cpuInfo = await this.client.GetCpuInfo();
      const cpInfo = await this.client.GetCpInfo();

      return {
        orderCode,
        cpuInfo,
        cpInfo,
      };
    } catch (error) {
      this.logger.error(`Error al obtener información del PLC: ${error.message}`);
      throw error;
    }
  }
}
