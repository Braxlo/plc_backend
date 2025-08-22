export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  plc: {
    defaultIp: process.env.PLC_DEFAULT_IP || '192.168.1.100',
    defaultRack: parseInt(process.env.PLC_DEFAULT_RACK || '0', 10),
    defaultSlot: parseInt(process.env.PLC_DEFAULT_SLOT || '1', 10),
    connectionTimeout: parseInt(process.env.PLC_CONNECTION_TIMEOUT || '5000', 10),
  },
});
