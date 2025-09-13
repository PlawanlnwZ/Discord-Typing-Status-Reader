const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const logEl = document.getElementById('log');

// Load alert sound
const alertSound = new Audio('alert.mp3');

function log(msg) {
    const ts = new Date().toLocaleTimeString();
    logEl.textContent = `[${ts}] ${msg}\n` + logEl.textContent;
}

// Default preset region
const DEFAULT_LEFT = 450;
const DEFAULT_TOP = 900;
const DEFAULT_WIDTH = 900;
const DEFAULT_HEIGHT = 50;

// Fill inputs with default values on first load
document.getElementById('left').value = DEFAULT_LEFT;
document.getElementById('top').value = DEFAULT_TOP;
document.getElementById('width').value = DEFAULT_WIDTH;
document.getElementById('height').value = DEFAULT_HEIGHT;

// Helper to enable/disable buttons
function setButtons(running) {
    startBtn.disabled = running;
    stopBtn.disabled = !running;
}

// Start detection
function startDetection() {
    const left = parseInt(document.getElementById('left').value, 10);
    const top = parseInt(document.getElementById('top').value, 10);
    const width = parseInt(document.getElementById('width').value, 10);
    const height = parseInt(document.getElementById('height').value, 10);
    const intervalMs = 800;

    window.electronAPI.startDetection({ left, top, width, height }, intervalMs);
    log(`Detection started at Left=${left}, Top=${top}, Width=${width}, Height=${height}`);
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

// Auto-start on load with default region
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
