import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as snap7 from 'node-snap7';

export interface PlcVariable {
  name: string;
  address: string;
  dataType: string;
  value?: any;
}

export interface PlcConnectionConfig {
  ip: string;
  rack?: number;
  slot?: number;
}

@Injectable()
export class PlcService implements OnModuleDestroy {
  private readonly logger = new Logger(PlcService.name);
  private client: snap7.S7Client;
  private isConnected = false;

  // Variables del PLC según la imagen
  private readonly plcVariables: PlcVariable[] = [
    { name: 'fechaHora', address: 'P#DB51.DBX164.0', dataType: 'DATE_AND_TIME' },
    { name: 'VB', address: '%DB1.DBD24', dataType: 'Real' },
    { name: 'CB', address: '%DB1.DBW28', dataType: 'DEC+/-' },
    { name: 'SW', address: '%DB1.DBW50', dataType: 'DEC+/-' },
    { name: 'ET', address: '%DB1.DBW16', dataType: 'DEC+/-' },
    { name: 'PT', address: '%DB1.DBW18', dataType: 'DEC+/-' },
    { name: 'VS', address: '%DB1.DBD36', dataType: 'Real' },
    { name: 'CS', address: '%DB1.DBW34', dataType: 'DEC+/-' },
  ];

  constructor() {
    this.client = new snap7.S7Client();
  }

  async connectToPlc(config: PlcConnectionConfig): Promise<boolean> {
    try {
      this.logger.log(`Intentando conectar al PLC en ${config.ip}...`);
      
      const result = await this.client.ConnectTo(config.ip, config.rack || 0, config.slot || 1);
      
      if (result === 0) {
        this.isConnected = true;
        this.logger.log('Conexión exitosa al PLC');
        return true;
      } else {
        this.logger.error(`Error al conectar al PLC. Código: ${result}`);
        this.isConnected = false;
        return false;
      }
    } catch (error) {
      this.logger.error('Error durante la conexión al PLC:', error);
      this.isConnected = false;
      return false;
    }
  }

  async disconnectFromPlc(): Promise<void> {
    if (this.isConnected) {
      try {
        await this.client.Disconnect();
        this.isConnected = false;
        this.logger.log('Desconectado del PLC');
      } catch (error) {
        this.logger.error('Error al desconectar del PLC:', error);
        this.isConnected = false;
      }
    }
  }

  async getConnectionStatus(): Promise<{ connected: boolean; ip?: string }> {
    return {
      connected: this.isConnected,
    };
  }

  async readAllVariables(): Promise<PlcVariable[]> {
    if (!this.isConnected) {
      throw new Error('No hay conexión activa con el PLC');
    }

    const variablesWithValues = [...this.plcVariables];
    
    for (const variable of variablesWithValues) {
      try {
        variable.value = await this.readVariable(variable.address, variable.dataType);
      } catch (error) {
        this.logger.error(`Error al leer variable ${variable.name}:`, error);
        variable.value = null;
      }
    }

    return variablesWithValues;
  }

  async readVariable(address: string, dataType: string): Promise<any> {
    if (!this.isConnected) {
      throw new Error('No hay conexión activa con el PLC');
    }

    try {
      // Convertir la dirección del PLC a formato snap7
      const parsedAddress = this.parsePlcAddress(address);
      
      if (!parsedAddress) {
        throw new Error(`Dirección de PLC no válida: ${address}`);
      }

      const buffer = await this.client.DBRead(parsedAddress.db, parsedAddress.start, parsedAddress.size);
      
      if (!buffer) {
        throw new Error('No se pudo leer datos del PLC');
      }

      return this.parseValue(buffer, dataType, parsedAddress.bitOffset);
    } catch (error) {
      this.logger.error(`Error al leer variable en dirección ${address}:`, error);
      throw error;
    }
  }

  private parsePlcAddress(address: string): { db: number; start: number; size: number; bitOffset?: number } | null {
    // Parsear direcciones como P#DB51.DBX164.0, %DB1.DBD24, %DB1.DBW28, etc.
    const dbMatch = address.match(/DB(\d+)/);
    if (!dbMatch) return null;

    const db = parseInt(dbMatch[1]);
    
    if (address.includes('DBX')) {
      // Para bits: P#DB51.DBX164.0
      const dbxMatch = address.match(/DBX(\d+)\.(\d+)/);
      if (dbxMatch) {
        const start = parseInt(dbxMatch[1]);
        const bitOffset = parseInt(dbxMatch[2]);
        return { db, start, size: 1, bitOffset };
      }
    } else if (address.includes('DBD')) {
      // Para double words (32 bits): %DB1.DBD24
      const dbdMatch = address.match(/DBD(\d+)/);
      if (dbdMatch) {
        const start = parseInt(dbdMatch[1]);
        return { db, start, size: 4 };
      }
    } else if (address.includes('DBW')) {
      // Para words (16 bits): %DB1.DBW28
      const dbwMatch = address.match(/DBW(\d+)/);
      if (dbwMatch) {
        const start = parseInt(dbwMatch[1]);
        return { db, start, size: 2 };
      }
    } else if (address.includes('DBB')) {
      // Para bytes (8 bits): %DB1.DBB30
      const dbbMatch = address.match(/DBB(\d+)/);
      if (dbbMatch) {
        const start = parseInt(dbbMatch[1]);
        return { db, start, size: 1 };
      }
    }

    return null;
  }

  private parseValue(buffer: Buffer, dataType: string, bitOffset?: number): any {
    try {
      switch (dataType) {
        case 'DATE_AND_TIME':
          // Para DTL (Date and Time), leer 12 bytes
          if (buffer.length >= 12) {
            // Simplificado - en producción se debería parsear correctamente el formato DTL
            return `DTL#${new Date().toISOString()}`;
          }
          break;
        
        case 'Real':
          // Para Real (32 bits float)
          if (buffer.length >= 4) {
            return buffer.readFloatLE(0);
          }
          break;
        
        case 'DEC+/-':
          // Para enteros con signo (16 bits)
          if (buffer.length >= 2) {
            return buffer.readInt16LE(0);
          }
          break;
        
        default:
          // Para bits individuales
          if (bitOffset !== undefined && buffer.length >= 1) {
            return (buffer[0] & (1 << bitOffset)) !== 0;
          }
          break;
      }
      
      return null;
    } catch (error) {
      this.logger.error('Error al parsear valor:', error);
      return null;
    }
  }

  onModuleDestroy() {
    this.disconnectFromPlc();
  }
}
