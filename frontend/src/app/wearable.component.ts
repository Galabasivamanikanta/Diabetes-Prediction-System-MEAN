import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { HealthBridgeService } from './health-bridge.service';

interface NearByDevice {
  id: string;
  name: string;
  type: string;
  signal: number;
  brand?: string;
}

@Component({
  selector: 'app-wearable',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="wearable-container">
      <div class="glass-card header-panel flex-header">
        <div>
          <h2 class="gradient-text">Wearable Bridge</h2>
          <p class="subtitle">{{ isHardwareMode ? 'Real-Time Hardware Discovery' : 'AI Simulation Environment' }}</p>
        </div>
        <div class="mode-toggle">
          <span [class.active]="!isHardwareMode">Demo</span>
          <label class="switch">
            <input type="checkbox" [(ngModel)]="isHardwareMode" (change)="disconnect()">
            <span class="slider round"></span>
          </label>
          <span [class.active]="isHardwareMode">Hardware</span>
        </div>
      </div>

      <!-- Pairing Mode -->
      <div class="pairing-container" *ngIf="!isConnected">
        <div class="glass-card pairing-card">
          <div class="bt-icon" [class.pairing]="isPairing">
            {{ isHardwareMode ? '📡' : '📱' }}
          </div>
          <h3>{{ isPairing ? 'Scanning...' : 'Device Discovery' }}</h3>
          <p *ngIf="!isPairing">
            {{ isHardwareMode ? 'Click below to open the browser Bluetooth picker for real devices.' : 'Search for simulated smart watches nearby.' }}
          </p>
          
          <button class="btn-primary" (click)="searchDevices()" *ngIf="!isPairing">
            {{ isHardwareMode ? 'Search Real Devices' : 'Search (Simulated)' }}
          </button>

          <!-- Discoverable Devices List (Demo Mode Only) -->
          <div class="device-list" *ngIf="isPairing && !isHardwareMode && !selectedDevice">
             <div class="device-item" *ngFor="let device of devices" (click)="connectToDevice(device)">
                <div class="device-icon">{{ device.type === 'Mobile' ? '📱' : device.type === 'Wearable' ? '⌚' : '📡' }}</div>
                <div class="device-info">
                   <div class="name">{{ device.brand ? device.brand + ' ' : '' }}{{ device.name }}</div>
                   <div class="type">{{ device.type }} • {{ device.id }}</div>
                </div>
                <!-- ... signal bars ... -->
             </div>
             <div class="loader-line"></div>
          </div>

          <!-- Connecting State -->
          <div class="connecting-ui" *ngIf="selectedDevice">
             <div class="handshake-anim">✨</div>
             <h3>Handshake with {{ selectedDevice.name }}</h3>
             <p>Establishing encrypted BLE connection...</p>
          </div>
        </div>
      </div>

      <!-- Live Vitals Dashboard (Connected) -->
      <div class="vitals-grid" *ngIf="isConnected">
        <div class="glass-card vital-card pulse">
          <div class="vital-header">
            <span class="icon">💓</span>
            <span class="label">Heart Rate</span>
          </div>
          <div class="vital-value">
            {{ currentHeartRate }} <span class="unit">BPM</span>
          </div>
          <div class="vital-status" [class.stable]="currentHeartRate < 100">
            {{ currentHeartRate < 100 ? 'Stable' : 'Elevated' }}
          </div>
        </div>

        <div class="glass-card vital-card">
          <div class="vital-header">
            <span class="icon">👟</span>
            <span class="label">Activity</span>
          </div>
          <div class="vital-value">
            {{ currentSteps }} <span class="unit">Steps</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="(currentSteps/10000)*100"></div>
          </div>
          <div class="vital-status">Goal: 10,000</div>
        </div>

        <div class="glass-card vital-card">
          <div class="vital-header">
            <span class="icon">🌙</span>
            <span class="label">Sleep Quality</span>
          </div>
          <div class="vital-value">
            82 <span class="unit">%</span>
          </div>
          <div class="vital-status stable">Restorative</div>
        </div>
      </div>

      <div class="glass-card terminal-panel" *ngIf="isConnected">
        <div class="terminal-header">
          <span>Live BLE Stream: {{ selectedDevice?.name }}</span>
          <span class="green-dot"></span>
        </div>
        <div class="terminal-body">
          <div class="log-entry" *ngFor="let log of logs">
            <span class="time">[{{ log.time }}]</span> {{ log.msg }}
          </div>
        </div>
        <div class="terminal-footer">
           <button class="btn-disconnect" (click)="disconnect()">Disconnect Device</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .flex-header { display: flex; justify-content: space-between; align-items: center; }
    .mode-toggle { display: flex; align-items: center; gap: 10px; font-size: 0.8rem; font-weight: 700; color: #64748b; }
    .mode-toggle .active { color: #2563eb; }
    
    /* Toggle Switch Styles */
    .switch { position: relative; display: inline-block; width: 44px; height: 22px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .4s; border-radius: 34px; }
    .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
    input:checked + .slider { background-color: #2563eb; }
    input:checked + .slider:before { transform: translateX(22px); }
    .pairing-container { display: flex; justify-content: center; padding: 40px 0; }
    .pairing-card { padding: 40px; text-align: center; width: 100%; max-width: 500px; }
    .bt-icon { font-size: 4rem; margin-bottom: 20px; }
    .bt-icon.pairing { animation: btPulse 1.5s infinite; }
    @keyframes btPulse { 0% { opacity: 0.5; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.1); } 100% { opacity: 0.5; transform: scale(0.9); } }

    .device-list { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: left; }
    .device-item { display: flex; align-items: center; padding: 15px; border-radius: 12px; cursor: pointer; transition: all 0.2s; margin-bottom: 10px; border: 1px solid transparent; }
    .device-item:hover { background: #f8fafc; border-color: #2563eb; transform: translateX(5px); }
    .device-icon { font-size: 1.5rem; margin-right: 15px; background: #eff6ff; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; border-radius: 10px; }
    .device-info { flex: 1; }
    .device-info .name { font-weight: 700; color: #1e293b; }
    .device-info .type { font-size: 0.75rem; color: #64748b; }
    .signal-strength { display: flex; align-items: flex-end; gap: 2px; height: 15px; }
    .signal-strength .bar { width: 3px; background: #10b981; border-radius: 1px; }

    .loader-line { height: 3px; width: 100%; background: #e2e8f0; position: relative; overflow: hidden; border-radius: 10px; margin-top: 20px; }
    .loader-line::after { content: ""; position: absolute; left: -50%; width: 50%; height: 100%; background: #2563eb; animation: moveLoader 2s infinite linear; }
    @keyframes moveLoader { 0% { left: -50%; } 100% { left: 100%; } }

    .connecting-ui { padding: 30px 0; }
    .handshake-anim { font-size: 3rem; animation: rotateHandshake 2s infinite ease-in-out; }
    @keyframes rotateHandshake { 0% { transform: scale(1) rotate(0deg); } 50% { transform: scale(1.2) rotate(180deg); } 100% { transform: scale(1) rotate(360deg); } }

    .vitals-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 25px; margin-bottom: 30px; }
    .vital-card { padding: 30px; border: 2px solid transparent; transition: all 0.3s; }
    .vital-header { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
    .vital-value { font-size: 3rem; font-weight: 800; line-height: 1; margin-bottom: 5px; }
    .vital-value .unit { font-size: 1rem; color: #64748b; }
    .vital-status { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }
    .vital-status.stable { color: #10b981; }
    .pulse { animation: cardPulse 3s infinite; }
    @keyframes cardPulse { 0% { box-shadow: 0 0 0 0 rgba(37,99,235,0.1); } 50% { box-shadow: 0 0 20px 10px rgba(37,99,235,0.05); } 100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.1); } }
    .progress-bar { width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; margin: 15px 0 10px; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #2563eb, #7c3aed); }

    .terminal-panel { padding: 0; background: #0f172a; border: 1px solid #1e293b; overflow: hidden; }
    .terminal-header { padding: 12px 20px; background: #1e293b; color: #94a3b8; font-family: monospace; font-size: 0.8rem; display: flex; justify-content: space-between; align-items: center; }
    .green-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px #10b981; }
    .terminal-body { padding: 20px; font-family: monospace; font-size: 0.85rem; color: #f1f5f9; height: 200px; overflow-y: auto; }
    .log-entry { margin-bottom: 8px; }
    .log-entry .time { color: #64748b; margin-right: 10px; }
    .terminal-footer { padding: 15px 20px; border-top: 1px solid #1e293b; display: flex; justify-content: flex-end; }
    .btn-disconnect { background: transparent; color: #ef4444; border: 1px solid #ef4444; padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; font-weight: 600; }
    .btn-disconnect:hover { background: #ef4444; color: white; }
  `]
})
export class WearableComponent implements OnInit, OnDestroy {
  isConnected = false;
  isPairing = false;
  isHardwareMode = false;
  devices: NearByDevice[] = [];
  selectedDevice: NearByDevice | null = null;

  currentHeartRate = 72;
  currentSteps = 6432;
  logs: { time: string, msg: string }[] = [];
  private sub?: Subscription;

  constructor(private healthService: HealthBridgeService) { }

  ngOnInit() {
    this.addLog('BLE Stack: Ready. Mode: ' + (this.isHardwareMode ? 'Hardware' : 'Demo'));
  }

  async searchDevices() {
    if (this.isHardwareMode) {
      this.addLog('Hardware: Requesting Bluetooth device picker...');
      try {
        // @ts-ignore - navigator.bluetooth is experimental
        const device = await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['heart_rate']
        });

        this.addLog(`Hardware: Found ${device.name || 'Unknown Device'}`);
        this.connectToDevice({
          id: device.id,
          name: device.name || 'BT Device',
          type: 'Hardware',
          signal: 100
        });
      } catch (err: any) {
        this.addLog('Hardware Error: ' + err.message);
        if (err.name === 'NotFoundError') {
          this.addLog('Scan cancelled by user.');
        }
      }
    } else {
      this.startPairing();
    }
  }

  startPairing() {
    this.isPairing = true;
    this.devices = [];
    this.addLog('Scan: Scanning for nearby simulated packets...');

    // Simulate finding diverse devices
    const possibleDevices = [
      { id: '31:7D:C8', name: 'Smart Band', type: 'Wearable', brand: 'Realme' },
      { id: 'AC:23:3F', name: 'Galaxy Phone', type: 'Mobile', brand: 'Samsung' },
      { id: 'BC:D0:74', name: 'iPhone 15', type: 'Mobile', brand: 'Apple' },
      { id: '63:EB:D1', name: 'Noise Watch', type: 'Wearable', brand: 'Noise' },
      { id: '23:8D:26', name: 'Medical Scale', type: 'IoT Device', brand: 'Withings' },
      { id: '17:D2:90', name: 'Boat Earbuds', type: 'Bluetooth', brand: 'Boat' }
    ];

    // Shuffle and pick 3-4 to show over time
    const selection = possibleDevices.sort(() => 0.5 - Math.random()).slice(0, 4);

    selection.forEach((dev, index) => {
      setTimeout(() => {
        this.devices.push({
          id: dev.id + '-' + Math.floor(Math.random() * 99),
          name: dev.name,
          brand: dev.brand,
          type: dev.type,
          signal: 60 + Math.floor(Math.random() * 35)
        });
        this.addLog(`Discovery: ${dev.brand} ${dev.name} detected.`);
      }, 800 * (index + 1));
    });
  }

  connectToDevice(device: NearByDevice) {
    this.selectedDevice = device;
    this.addLog(`User selected ${device.name}. Starting secure handshake...`);

    setTimeout(() => {
      this.isConnected = true;
      this.isPairing = false;
      this.addLog(`Handshake successful. Link established with ${device.id}.`);
      this.startDataStream();
    }, 2000);
  }

  startDataStream() {
    this.sub = interval(2000).subscribe(() => {
      this.currentHeartRate = Math.floor(70 + Math.random() * 10);
      this.currentSteps += Math.floor(Math.random() * 5);
      this.healthService.updateLiveHeartRate(this.currentHeartRate);

      if (this.logs.length > 50) this.logs.pop();

      const name = this.selectedDevice?.name || 'Device';
      const type = this.selectedDevice?.type;
      const prefix = type === 'Mobile' ? `📱 ${name}` : type === 'Wearable' ? `⌚ ${name}` : `📡 ${name}`;
      this.addLog(`${prefix}: HR=${this.currentHeartRate} STEPS=${this.currentSteps} [Stable]`);
    });
  }

  disconnect() {
    this.isConnected = false;
    this.isPairing = false;
    this.selectedDevice = null;
    this.devices = [];
    this.sub?.unsubscribe();
    this.addLog('Device disconnected by user.');
  }

  addLog(msg: string) {
    const time = new Date().toLocaleTimeString();
    this.logs.unshift({ time, msg });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
