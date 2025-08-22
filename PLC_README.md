# Módulo PLC para NestJS

Este módulo permite la comunicación con PLCs Siemens S7-1200 usando el protocolo S7 a través de la librería `node-snap7`.

## Variables del PLC Configuradas

El sistema está configurado para leer las siguientes variables del PLC:

| Nombre | Dirección PLC | Tipo de Dato | Descripción |
|--------|---------------|---------------|-------------|
| fechaHora | P#DB51.DBX164.0 | DATE_AND_TIME | Fecha y hora del sistema |
| VB | %DB1.DBD24 | Real | Variable VB (32 bits float) |
| CB | %DB1.DBW28 | DEC+/- | Variable CB (16 bits integer) |
| SW | %DB1.DBW50 | DEC+/- | Variable SW (16 bits integer) |
| ET | %DB1.DBW16 | DEC+/- | Variable ET (16 bits integer) |
| PT | %DB1.DBW18 | DEC+/- | Variable PT (16 bits integer) |
| VS | %DB1.DBD36 | Real | Variable VS (32 bits float) |
| CS | %DB1.DBW34 | DEC+/- | Variable CS (16 bits integer) |

## Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con la siguiente configuración:

```env
# Configuración del PLC
PLC_DEFAULT_IP=192.168.1.100
PLC_DEFAULT_RACK=0
PLC_DEFAULT_SLOT=1
PLC_CONNECTION_TIMEOUT=5000

# Puerto de la aplicación
PORT=3000
```

### Configuración del PLC

- **IP**: Dirección IP del PLC S7-1200
- **Rack**: Número de rack (por defecto 0)
- **Slot**: Número de slot (por defecto 1)

## Endpoints de la API

### 1. Conectar al PLC
```http
POST /plc/connect
Content-Type: application/json

{
  "ip": "192.168.1.100",
  "rack": 0,
  "slot": 1
}
```

### 2. Desconectar del PLC
```http
POST /plc/disconnect
```

### 3. Verificar Estado de Conexión
```http
GET /plc/status
```

### 4. Leer Todas las Variables
```http
GET /plc/variables
```

### 5. Leer Variable Específica
```http
GET /plc/variables/:name
Content-Type: application/json

{
  "address": "%DB1.DBD24",
  "dataType": "Real"
}
```

## Ejemplo de Uso

### 1. Conectar al PLC
```bash
curl -X POST http://localhost:3000/plc/connect \
  -H "Content-Type: application/json" \
  -d '{"ip": "192.168.1.100"}'
```

### 2. Leer Todas las Variables
```bash
curl http://localhost:3000/plc/variables
```

### 3. Verificar Estado
```bash
curl http://localhost:3000/plc/status
```

## Respuestas de la API

### Conexión Exitosa
```json
{
  "success": true,
  "message": "Conexión exitosa al PLC",
  "timestamp": "2025-01-22T22:30:00.000Z"
}
```

### Variables del PLC
```json
{
  "success": true,
  "variables": [
    {
      "name": "VB",
      "address": "%DB1.DBD24",
      "dataType": "Real",
      "value": 54.37
    }
  ],
  "count": 8,
  "timestamp": "2025-01-22T22:30:00.000Z"
}
```

## Manejo de Errores

El sistema incluye manejo robusto de errores para:
- Fallos de conexión al PLC
- Errores de lectura de variables
- Timeouts de conexión
- Direcciones de PLC inválidas

## Dependencias

- `node-snap7`: Para comunicación S7 con el PLC
- `@nestjs/config`: Para manejo de configuración
- `@nestjs/common`: Framework base de NestJS

## Notas Importantes

1. **Seguridad**: Asegúrate de que el PLC esté en una red segura
2. **Firewall**: Verifica que el puerto 102 (S7) esté abierto
3. **Configuración del PLC**: El PLC debe tener habilitada la comunicación S7
4. **Direcciones**: Verifica que las direcciones de las variables sean correctas en tu PLC

## Solución de Problemas

### Error de Conexión
- Verifica la IP del PLC
- Confirma que el PLC esté encendido y en red
- Verifica la configuración de rack y slot

### Error de Lectura
- Verifica que las direcciones de las variables sean correctas
- Confirma que el PLC tenga acceso a las DBs especificadas
- Verifica los permisos de lectura en el PLC
