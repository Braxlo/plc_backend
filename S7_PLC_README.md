# Sistema de Comunicación con PLCs Siemens S7 - Backend NestJS

Este backend permite comunicarse con PLCs Siemens S7 (S7-1200, S7-300, S7-400) usando el protocolo S7 a través de `node-snap7`.

## Características

- ✅ Conexión TCP/IP a PLCs Siemens S7
- ✅ Lectura de variables de Data Blocks (DB)
- ✅ Escritura de variables de Data Blocks
- ✅ Soporte para tipos: BOOL, INT, DINT, REAL, STRING
- ✅ Lectura especial de fecha y hora S7
- ✅ Información del PLC (CPU, CP, Order Code)
- ✅ API REST completa
- ✅ Logging detallado

## Variables Configuradas

El sistema está configurado con las siguientes variables específicas de tu PLC S7-1200:

| Variable | Dirección S7 | Tipo | Tamaño | Descripción |
|----------|--------------|------|--------|-------------|
| **Fecha_Hora** | `P#DB51.DBX164.0` | STRING | 8 bytes | Fecha y hora del sistema |
| **VB** | `%DB1.DBD24` | REAL | 4 bytes | Variable VB |
| **CB** | `%DB1.DBW28` | INT | 2 bytes | Variable CB |
| **SW** | `%DB1.DBW50` | INT | 2 bytes | Variable SW |
| **ET** | `%DB1.DBW16` | INT | 2 bytes | Variable ET |
| **PT** | `%DB1.DBW18` | INT | 2 bytes | Variable PT |
| **VS** | `%DB1.DBD36` | REAL | 4 bytes | Variable VS |
| **CS** | `%DB1.DBW34` | INT | 2 bytes | Variable CS |

## Instalación

```bash
npm install node-snap7
```

## Uso de la API S7

### 1. Conectar al PLC S7

```bash
POST /s7-plc/connect
Content-Type: application/json

{
  "ip": "192.168.1.100",
  "rack": 0,
  "slot": 1
}
```

**Parámetros:**
- `ip`: Dirección IP del PLC
- `rack`: Número de rack (por defecto: 0)
- `slot`: Número de slot (por defecto: 1)

### 2. Verificar Estado de Conexión

```bash
GET /s7-plc/status
```

### 3. Obtener Variables Configuradas

```bash
GET /s7-plc/variables
```

### 4. Leer Variables

```bash
POST /s7-plc/read
Content-Type: application/json

{
  "variables": [
    {
      "name": "VB",
      "dbNumber": 1,
      "start": 24,
      "size": 4,
      "type": "real"
    },
    {
      "name": "CB",
      "dbNumber": 1,
      "start": 28,
      "size": 2,
      "type": "int"
    }
  ]
}
```

### 5. Leer Variable Individual

```bash
POST /s7-plc/read-single
Content-Type: application/json

{
  "name": "VB",
  "dbNumber": 1,
  "start": 24,
  "size": 4,
  "type": "real"
}
```

### 6. Escribir Variable

```bash
POST /s7-plc/write
Content-Type: application/json

{
  "variable": {
    "name": "CB",
    "dbNumber": 1,
    "start": 28,
    "size": 2,
    "type": "int"
  },
  "value": 100
}
```

### 7. Leer Fecha y Hora

```bash
POST /s7-plc/read-datetime
Content-Type: application/json

{
  "dbNumber": 51,
  "start": 164
}
```

### 8. Obtener Información del PLC

```bash
GET /s7-plc/plc-info
```

### 9. Desconectar del PLC

```bash
POST /s7-plc/disconnect
```

## Ejemplos de Uso

### Ejemplo 1: Monitoreo Continuo de Variables

```typescript
// Conectar al PLC S7
await fetch('/s7-plc/connect', {
  method: 'POST',
  body: JSON.stringify({ 
    ip: '192.168.1.100',
    rack: 0,
    slot: 1
  })
});

// Leer variables cada 2 segundos
setInterval(async () => {
  const response = await fetch('/s7-plc/read', {
    method: 'POST',
    body: JSON.stringify({
      variables: [
        { name: 'VB', dbNumber: 1, start: 24, size: 4, type: 'real' },
        { name: 'CB', dbNumber: 1, start: 28, size: 2, type: 'int' },
        { name: 'SW', dbNumber: 1, start: 50, size: 2, type: 'int' }
      ]
    })
  });
  
  const data = await response.json();
  console.log('Datos del PLC S7:', data.data);
}, 2000);
```

### Ejemplo 2: Control de Variables

```typescript
// Escribir valor en variable CB
await fetch('/s7-plc/write', {
  method: 'POST',
  body: JSON.stringify({
    variable: { 
      name: 'CB', 
      dbNumber: 1, 
      start: 28, 
      size: 2, 
      type: 'int' 
    },
    value: 150
  })
});

// Verificar valor escrito
const response = await fetch('/s7-plc/read-single', {
  method: 'POST',
  body: JSON.stringify({
    name: 'CB',
    dbNumber: 1,
    start: 28,
    size: 2,
    type: 'int'
  })
});

const data = await response.json();
console.log('CB actual:', data.value);
```

### Ejemplo 3: Lectura de Fecha y Hora

```typescript
// Leer fecha y hora del PLC
const response = await fetch('/s7-plc/read-datetime', {
  method: 'POST',
  body: JSON.stringify({
    dbNumber: 51,
    start: 164
  })
});

const data = await response.json();
console.log('Fecha/Hora del PLC:', data.dateTime);
```

## Tipos de Variables S7

| Tipo S7 | Tamaño | Descripción | Ejemplo |
|----------|--------|-------------|---------|
| **BOOL** | 1 byte | Variable booleana | `true/false` |
| **INT** | 2 bytes | Entero de 16 bits | `-32768` a `32767` |
| **DINT** | 4 bytes | Entero de 32 bits | `-2147483648` a `2147483647` |
| **REAL** | 4 bytes | Número de punto flotante | `3.14159` |
| **STRING** | Variable | Cadena de texto | `"Hola Mundo"` |

## Configuración de Red

### Parámetros de Conexión

- **Rack**: Generalmente 0 para S7-1200
- **Slot**: Generalmente 1 para S7-1200
- **IP**: Dirección IP del PLC en la red
- **Puerto**: Por defecto usa el puerto S7 (102)

### Configuración del PLC

Asegúrate de que tu PLC S7-1200 tenga:

1. **Comunicación TCP/IP habilitada**
2. **Dirección IP configurada**
3. **Firewall permitiendo conexiones S7**
4. **Data Blocks (DB) configurados correctamente**

## Solución de Problemas

### Error de Conexión
- Verifica que la IP del PLC sea correcta
- Confirma que el rack y slot sean correctos
- Verifica la configuración de red del PLC

### Error de Lectura/Escritura
- Confirma que las direcciones DB sean correctas
- Verifica que el tipo de variable coincida
- Asegúrate de que el DB esté configurado en el PLC

### Variables No Encontradas
- Revisa la configuración en `s7-plc-variables.config.ts`
- Confirma que las direcciones sean correctas para tu PLC
- Verifica que los Data Blocks existan en el PLC

## Seguridad

⚠️ **ADVERTENCIA**: Este sistema permite control directo de PLCs S7. Asegúrate de:

1. Implementar autenticación/autorización
2. Validar todas las entradas
3. Limitar acceso a redes seguras
4. Hacer pruebas en entorno de desarrollo
5. Usar VPN si es necesario

## Personalización

Para agregar o modificar variables, edita el archivo `src/plc/s7-plc-variables.config.ts`:

```typescript
export const S7_PLC_VARIABLES: S7PlcVariable[] = [
  {
    name: 'Nueva_Variable',
    dbNumber: 1,
    start: 100,
    size: 4,
    type: 'real',
    description: 'Descripción de la nueva variable'
  }
];
```

¡Listo para usar con tu PLC S7-1200! 🚀
