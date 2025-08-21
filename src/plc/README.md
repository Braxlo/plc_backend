# Módulo PLC - Comunicación con PLC S7-1200

Este módulo permite la comunicación con PLCs Siemens S7-1200 usando el protocolo S7 a través de la librería `node-snap7`.

## Variables Disponibles

| Variable | Dirección | Tipo | Descripción |
|----------|-----------|------|-------------|
| fechaHora | P#DB51.DBX164.0 | string | Fecha y hora del sistema |
| vb | %DB1.DBD24 | real | Variable VB |
| cb | %DB1.DBW28 | int | Variable CB |
| sw | %DB1.DBW50 | int | Variable SW |
| et | %DB1.DBW16 | int | Variable ET |
| pt | %DB1.DBW18 | int | Variable PT |
| vs | %DB1.DBD36 | real | Variable VS |
| cs | %DB1.DBW34 | int | Variable CS |

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

### 3. Verificar estado de conexión
```http
GET /plc/status
```

### 4. Leer todas las variables
```http
GET /plc/variables
```

### 5. Obtener información del PLC
```http
GET /plc/info
```

## Ejemplo de Uso

### Conectar al PLC
```bash
curl -X POST http://localhost:3000/plc/connect \
  -H "Content-Type: application/json" \
  -d '{"ip": "192.168.1.100"}'
```

### Leer variables
```bash
curl http://localhost:3000/plc/variables
```

## Respuestas de la API

### Conexión exitosa
```json
{
  "success": true,
  "message": "Conectado exitosamente al PLC en 192.168.1.100",
  "ip": "192.168.1.100",
  "rack": 0,
  "slot": 1
}
```

### Variables del PLC
```json
{
  "fechaHora": "2024-01-15 14:30:25",
  "vb": 25.5,
  "cb": 100,
  "sw": 200,
  "et": 150,
  "pt": 75,
  "vs": 12.8,
  "cs": 300
}
```

## Configuración

El módulo está configurado para:
- Rack por defecto: 0
- Slot por defecto: 1
- Timeout de conexión: 5000ms
- Intentos de reconexión: 3

## Notas Importantes

1. **Seguridad**: Asegúrate de que el PLC esté en una red segura
2. **Firewall**: Verifica que el puerto 102 (S7) esté abierto
3. **Configuración del PLC**: El PLC debe tener habilitada la comunicación S7
4. **Direcciones IP**: Usa direcciones IP estáticas para el PLC

## Solución de Problemas

### Error de conexión
- Verifica que la IP sea correcta
- Confirma que el PLC esté encendido y en red
- Revisa la configuración de firewall

### Error de lectura
- Verifica que la conexión esté activa
- Confirma que las direcciones de memoria sean correctas
- Revisa que el PLC tenga los datos en las ubicaciones especificadas
