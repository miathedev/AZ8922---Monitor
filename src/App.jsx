import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import SerialReader from './services/SerialReader';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [threshold, setThreshold] = useState(80);
  const [alarmActive, setAlarmActive] = useState(false);
  const [alarmTriggered, setAlarmTriggered] = useState(false);
  const [history, setHistory] = useState([]);
  const serialReaderRef = useRef(null);
  const audioContextRef = useRef(null);
  const alarmIntervalRef = useRef(null);

  // Initialize audio context for alarm sound
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current && typeof AudioContext !== 'undefined') {
        audioContextRef.current = new AudioContext();
      }
    };
    document.addEventListener('click', initAudio, { once: true });
    return () => document.removeEventListener('click', initAudio);
  }, []);

  const playAlarmSound = useCallback(() => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const beepDuration = 0.2; // 200ms beep
    const pauseDuration = 0.1; // 100ms pause
    const cycleTime = beepDuration + pauseDuration;
    
    // Create repeating beeps
    const beepCount = 10; // 10 beeps per cycle
    const now = ctx.currentTime;
    
    for (let i = 0; i < beepCount; i++) {
      const startTime = now + i * cycleTime;
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = 800; // 800 Hz beep
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.setValueAtTime(0, startTime + beepDuration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + beepDuration);
    }
  }, []);

  const triggerAlarm = useCallback(() => {
    setAlarmTriggered(true);
    setAlarmActive(true);

    if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    alarmIntervalRef.current = setInterval(() => {
      playAlarmSound();
    }, 2000);

    playAlarmSound();
  }, [playAlarmSound]);

  // Check alarm condition
  useEffect(() => {
    if (currentLevel >= threshold && !alarmTriggered) {
      triggerAlarm();
    }
  }, [currentLevel, threshold, alarmTriggered, triggerAlarm]);

  const handleConnect = async () => {
    try {
      if (serialReaderRef.current) {
        await serialReaderRef.current.disconnect();
        setIsConnected(false);
        return;
      }

      const reader = new SerialReader(
        (level) => {
          setCurrentLevel(level);
          setHistory((prev) => [...prev.slice(-59), level]); // Keep last 60s (~1 reading/s)
        },
        () => setIsConnected(true),
        () => setIsConnected(false)
      );

      await reader.connect();
      serialReaderRef.current = reader;
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleResetAlarm = () => {
    setAlarmTriggered(false);
    setAlarmActive(false);
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  };

  const handleThresholdChange = (e) => {
    setThreshold(Number(e.target.value));
  };

  return (
    <div className={`app ${alarmActive ? 'alarm-active' : ''}`}>
      <div className="container">
        <header>
          <h1>AZ8922 Sound Level Monitor</h1>
          <p className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '● Connected' : '● Disconnected'}
          </p>
        </header>

        <main>
          {/* Display Section */}
          <section className="display-section">
            <div className="level-display">
              <div className={`level-value ${currentLevel >= threshold ? 'alarm' : ''}`}>
                {currentLevel.toFixed(1)}
              </div>
              <div className="level-unit">dB</div>
            </div>
            <div className="level-bar-container">
              <div 
                className={`level-bar ${currentLevel >= threshold ? 'alarm' : ''}`}
                style={{ width: `${Math.min((currentLevel / 100) * 100, 100)}%` }}
              ></div>
            </div>
          </section>

          {/* Control Section */}
          <section className="control-section">
            <div className="control-group">
              <label htmlFor="threshold">Alarm Threshold (dB)</label>
              <div className="threshold-input-group">
                <input
                  id="threshold"
                  type="range"
                  min="30"
                  max="120"
                  value={threshold}
                  onChange={handleThresholdChange}
                  disabled={!isConnected}
                />
                <span className="threshold-value">{threshold}</span>
              </div>
            </div>

            <button 
              className={`connect-btn ${isConnected ? 'disconnect' : 'connect'}`}
              onClick={handleConnect}
            >
              {isConnected ? 'Disconnect Device' : 'Connect Device'}
            </button>
          </section>

          {/* Alarm Section */}
          {alarmTriggered && (
            <section className={`alarm-section ${alarmActive ? 'active' : ''}`}>
              <div className="alarm-indicator">⚠️ ALARM</div>
              <p className="alarm-message">
                Sound level {currentLevel.toFixed(1)} dB exceeds threshold {threshold} dB
              </p>
              <button className="reset-btn" onClick={handleResetAlarm}>
                Reset Alarm
              </button>
            </section>
          )}

          {/* Stats Section */}
          <section className="stats-section">
            <div className="stat-item">
              <span className="stat-label">Current:</span>
              <span className="stat-value">{currentLevel.toFixed(1)} dB</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Threshold:</span>
              <span className="stat-value">{threshold} dB</span>
            </div>
          </section>

          {/* Mini Chart */}
          {history.length > 0 && (
            <section className="chart-section">
              <h3>Sound Level History</h3>
              <svg className="chart" viewBox={`0 0 ${history.length} 100`} preserveAspectRatio="none">
                <polyline
                  points={history.map((level, i) => `${i},${100 - (level / 120) * 100}`).join(' ')}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
              </svg>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
