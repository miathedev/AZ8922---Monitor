# AZ8922 Sound Level Monitor

A web-based application for monitoring sound levels with the AZ8922 digital sound level meter.

## Features

- Real-time sound level monitoring
- Customizable alarm threshold with hold function
- Audio alert when threshold is exceeded
- Visual history chart
- Works in modern web browsers (Chrome, Edge, Opera)
- Responsive mobile-friendly design
- Deploy to GitHub Pages

## Requirements

- AZ8922 sound level meter with USB serial adapter
- Modern web browser with Web Serial API support (Chrome 89+, Edge 89+, Opera 75+)

## Getting Started

### Development

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/AZ8922---Monitor.git
   cd AZ8922---Monitor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Deployment to GitHub Pages

1. Update the `homepage` URL in `package.json` with your repository URL

2. Deploy:
   ```bash
   npm run deploy
   ```

3. Access your app at: `https://yourusername.github.io/AZ8922---Monitor`

## How to Use

1. **Connect Device**: Click "Connect Device" and select the AZ8922 in the dialog
2. **Set Threshold**: Use the slider to set the dB threshold (default 80dB)
3. **Monitor**: Watch the real-time sound level display and history chart
4. **Alarm**: When the level exceeds the threshold:
   - Visual red alert with pulsing animation
   - Audio beep alarm
   - Alarm stays active until manually reset
5. **Reset**: Click "Reset Alarm" to clear the alarm state

## Technical Details

- **Communication**: Web Serial API (2400 baud)
- **Format**: `N:XXX.X\r\n` (e.g., `N:045.5\r\n`)
- **UI Framework**: React 18
- **Audio**: Web Audio API for alarm sound
- **Charts**: SVG-based visualization

## Supported Browsers

- ✅ Chrome 89+
- ✅ Edge 89+
- ✅ Opera 75+
- ❌ Firefox (no Web Serial API support)
- ❌ Safari (no Web Serial API support)

## Building

```bash
npm run build
```

This creates an optimized build in the `build/` directory.

## License

MIT

## Support

For issues or feature requests, please open an issue on GitHub.
