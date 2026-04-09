const { SerialPort } = require('serialport');
const net = require('net');

// URL API Backend
const WEBHOOK_URL = 'https://api.domainkamu.com/webhook/raw-log';

// Send Webhook helper
async function sendWebhook(type, source, rawData) {
    try {
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: type,            // 'SERIAL' atau 'TCP'
                source: source,        // 'COM3' atau '192.168.1.10:5000'
                data: rawData,         // String mentah dari alat
                timestamp: new Date().toISOString()
            })
        });
        console.log(`[${type}] Data sukses dikirim dari ${source}`);
    } catch (err) {
        console.error('Gagal mengirim webhook:', err.message);
    }
}

// ── SERIAL PORT MONITORING ───────────────────────────────────────────────────
let activeSerialPorts = new Set();

async function monitorSerialPorts(onDeviceChange) {
    setInterval(async () => {
        try {
            const ports = await SerialPort.list();
            const currentPathSet = new Set(ports.map(p => p.path));

            // Detect new ports
            for (const portInfo of ports) {
                if (!activeSerialPorts.has(portInfo.path)) {
                    console.log(`[Serial] New device detected: ${portInfo.path}`);
                    startSerialListener(portInfo.path);
                    if (onDeviceChange) onDeviceChange('SERIAL_CONNECTED', portInfo.path);
                }
            }

            // Clean up removed ports
            for (const path of activeSerialPorts) {
                if (!currentPathSet.has(path)) {
                    console.log(`[Serial] Device removed: ${path}`);
                    activeSerialPorts.delete(path);
                    if (onDeviceChange) onDeviceChange('SERIAL_DISCONNECTED', path);
                }
            }
        } catch (err) {
            console.error('Error listing serial ports:', err);
        }
    }, 2000);
}

function startSerialListener(path) {
    const port = new SerialPort({ path, baudRate: 9600 }, (err) => {
        if (err) {
            console.log(`[Serial] Failed to open ${path}: ${err.message}`);
            return;
        }
        activeSerialPorts.add(path);
        console.log(`[Serial] Successfully listening on ${path}`);
    });

    port.on('data', (data) => {
        sendWebhook('SERIAL', path, data.toString('utf8'));
    });

    port.on('error', (err) => {
        console.error(`[Serial] Port ${path} error:`, err.message);
        activeSerialPorts.delete(path);
    });

    port.on('close', () => {
        console.log(`[Serial] Port ${path} closed`);
        activeSerialPorts.delete(path);
    });
}

// ── TCP PORT MONITORING ──────────────────────────────────────────────────────
function startTcpListeners(portsToListen, onDeviceChange) {
    portsToListen.forEach(portNumber => {
        const server = net.createServer((socket) => {
            const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
            console.log(`[TCP] Alat Lab terkoneksi dari: ${clientAddress}`);
            
            if (onDeviceChange) onDeviceChange('TCP_CONNECTED', clientAddress);

            socket.on('data', (data) => {
                sendWebhook('TCP', clientAddress, data.toString('utf8'));
            });

            socket.on('error', (err) => {
                console.error(`[TCP] Error socket ${clientAddress}:`, err.message);
            });

            socket.on('close', () => {
                console.log(`[TCP] Connection closed: ${clientAddress}`);
                if (onDeviceChange) onDeviceChange('TCP_DISCONNECTED', clientAddress);
            });
        });

        server.listen(portNumber, '0.0.0.0', () => {
            console.log(`[TCP] Listener aktif di port ${portNumber}`);
        });
    });
}

module.exports = {
    monitorSerialPorts,
    startTcpListeners
};
