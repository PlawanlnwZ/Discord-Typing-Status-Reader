const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const screenshot = require('screenshot-desktop');
const Tesseract = require('tesseract.js');
const sharp = require('sharp');

let mainWindow;
let intervalId = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 720,
        height: 520,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true
        }
    });
    mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

// Start OCR detection
ipcMain.on('start-detection', (event, { region, intervalMs }) => {
    if (intervalId) return; // already running
    intervalId = setInterval(async () => {
        try {
            const imgBuffer = await screenshot({ format: 'png' });
            const cropped = await sharp(imgBuffer)
                .extract({ left: region.left, top: region.top, width: region.width, height: region.height })
                .png()
                .toBuffer();
            const { data: { text } } = await Tesseract.recognize(cropped, 'eng+tha', { tessedit_pageseg_mode: 6 });
            const trimmed = text.trim();
            const detected = /is typing|typing|กำลังพิมพ์/i.test(trimmed);
            mainWindow.webContents.send('log', detected ? 'TYPING detected! ' + trimmed : 'No typing. ' + trimmed);
        } catch (err) {
            mainWindow.webContents.send('log', 'Error: ' + err.message);
        }
    }, intervalMs);
});


// Stop detection
ipcMain.on('stop-detection', () => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        mainWindow.webContents.send('log', 'Detection stopped.');
    }
});
