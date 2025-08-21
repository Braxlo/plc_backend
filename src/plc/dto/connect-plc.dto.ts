import { IsIP, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class ConnectPlcDto {
  @IsIP(4, { message: 'La IP debe ser una dirección IPv4 válida' })
  ip: string;

  @IsOptional()
  @IsNumber({}, { message: 'El rack debe ser un número' })
  @Min(0, { message: 'El rack debe ser mayor o igual a 0' })
  @Max(7, { message: 'El rack debe ser menor o igual a 7' })
  rack?: number = 0;

  @IsOptional()
  @IsNumber({}, { message: 'El slot debe ser un número' })
  @Min(0, { message: 'El slot debe ser mayor o igual a 0' })
  @Max(31, { message: 'El slot debe ser menor o igual a 31' })
  slot?: number = 1;
}
