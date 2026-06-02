const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const app = express();

app.use(express.json());

// 1. Configuración del Cliente de WhatsApp
const client = new Client({
    authStrategy: new LocalAuth(), // Guarda la sesión para no escanear el QR cada vez
    puppeteer: { headless: true, args: ['--no-sandbox'] }
});

// Generar el código QR para vincular tu teléfono
client.on('qr', (qr) => {
    console.log('Escanea este código QR con tu WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('¡WhatsApp conectado y listo!');
});

// 2. Endpoint que recibirá órdenes de tu API de C#
app.post('/enviar-codigo', async (req, res) => {
    const { telefono, codigo } = req.body;

    if (!telefono || !codigo) {
        return res.status(400).json({ error: 'Faltan datos (telefono o codigo)' });
    }

    try {
        // Formatear el número (Ej: de 912345678 a 56912345678@c.us)
        const chatId = `${telefono}@c.us`; 
        const mensaje = `Tu código de verificación para Tu Partner Peludo es: ${codigo}`;
        
        await client.sendMessage(chatId, mensaje);
        console.log(`Código ${codigo} enviado a ${telefono}`);
        res.json({ success: true, message: 'Mensaje enviado' });
    } catch (error) {
        console.error('Error al enviar WhatsApp:', error);
        res.status(500).json({ error: 'No se pudo enviar el mensaje' });
    }
});

app.listen(3000, () => {
    console.log('Servidor Gateway escuchando en http://localhost:3000');
});

client.initialize();