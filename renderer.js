const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const logEl = document.getElementById('log');

// Load alert sound
const alertSound = new Audio('alert.mp3');

function log(msg) {
    const ts = new Date().toLocaleTimeString();
    logEl.textContent = `[${ts}] ${msg}\n` + logEl.textContent;
}

// Auto-set region when app opens
const LEFT = 450;
const TOP = 900;
const WIDTH = 900;
const HEIGHT = 50;

document.getElementById('left').value = LEFT;
document.getElementById('top').value = TOP;
document.getElementById('width').value = WIDTH;
document.getElementById('height').value = HEIGHT;

// Helper to enable/disable buttons
function setButtons(running) {
    startBtn.disabled = running;
    stopBtn.disabled = !running;
}

// Start detection
function startDetection() {
    const intervalMs = 800;
    window.electronAPI.startDetection({ left: LEFT, top: TOP, width: WIDTH, height: HEIGHT }, intervalMs);
    log('Auto detection started with preset region.');
    setButtons(true);
}

// Stop detection
function stopDetection() {
    window.electronAPI.stopDetection();
    log('Detection stopped.');
    setButtons(false);
}

// Bind buttons
startBtn.addEventListener('click', startDetection);
stopBtn.addEventListener('click', stopDetection);

// Start automatically on app load
window.addEventListener('DOMContentLoaded', () => {
    startDetection();
});

// Listen for logs from main
window.electronAPI.onLog((msg) => {
    log(msg);
    if (msg.includes('TYPING detected')) {
        alertSound.play().catch(err => console.log('Audio play error:', err));
    }
});
