/* ===== ocrService.js ===== */
const screenshot = require('screenshot-desktop');
const sharp = require('sharp');
const { createWorker } = require('tesseract.js');

module.exports = class OCRService {
  constructor(config, sendFn) {
    // config: { region: {left, top, width, height}, interval }
    this.region = config.region;
    this.interval = config.interval || 1200;
    this.sendFn = sendFn || (() => {});
    this._timer = null;
    this._running = false;
    this.worker = createWorker({
      // logger: m => console.log(m)
    });
  }

  async start() {
    await this.worker.load();
    await this.worker.loadLanguage('eng');
    await this.worker.initialize('eng');
    this._running = true;
    this._loop();
  }

  async _loop(){
    while(this._running){
      try{
        const imgBuffer = await screenshot({ format: 'png' });
        // crop using sharp
        const { left, top, width, height } = this.region;
        const cropped = await sharp(imgBuffer).extract({ left: Math.max(0,left), top: Math.max(0,top), width: width, height: height }).png().toBuffer();
        const { data: { text } } = await this.worker.recognize(cropped);
        const trimmed = (text || '').trim();
        this.sendFn('typing-event', { detected: /is typing|typing|กำลังพิมพ์/i.test(trimmed), text: trimmed });
      }catch(err){
        this.sendFn('typing-event', { error: String(err) });
      }
      await new Promise(r => setTimeout(r, this.interval));
    }
  }

  async stop(){
    this._running = false;
    try{ await this.worker.terminate(); }catch(e){}
  }
}