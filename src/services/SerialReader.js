/**
 * SerialReader - Manages communication with AZ8922 device via Web Serial API
 * Handles:
 * - Connection/disconnection
 * - Data parsing (N:045.5\r\n format)
 * - Event callbacks
 */

class SerialReader {
  constructor(onDataCallback, onConnectCallback, onDisconnectCallback) {
    this.onDataCallback = onDataCallback;
    this.onConnectCallback = onConnectCallback;
    this.onDisconnectCallback = onDisconnectCallback;
    this.port = null;
    this.reader = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // Check if Web Serial API is available
      if (!navigator.serial) {
        throw new Error(
          'Web Serial API not supported. Please use Chrome, Edge, or Opera.'
        );
      }

      // Open port selection dialog
      this.port = await navigator.serial.requestPort();

      // Open the port
      await this.port.open({ baudRate: 2400 });

      this.isConnected = true;
      this.onConnectCallback();

      // Start reading data
      this.readData();
    } catch (error) {
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.reader) {
        await this.reader.cancel();
      }
      if (this.port) {
        await this.port.close();
      }
      this.isConnected = false;
      this.onDisconnectCallback();
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }

  async readData() {
    try {
      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
      this.reader = textDecoder.readable.getReader();

      let buffer = '';

      while (true) {
        const { value, done } = await this.reader.read();

        if (done) {
          this.reader.releaseLock();
          break;
        }

        buffer += value;

        // Process complete lines
        const lines = buffer.split('\n');
        // Keep the last incomplete line in the buffer
        buffer = lines[lines.length - 1];

        for (let i = 0; i < lines.length - 1; i++) {
          this.processLine(lines[i]);
        }
      }

      await readableStreamClosed.catch(() => {
        /* Ignore errors from closing */
      });
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Read error:', error);
      }
    } finally {
      this.isConnected = false;
      this.onDisconnectCallback();
    }
  }

  processLine(line) {
    // Parse format: N:045.5\r\n
    const match = line.match(/N:(\d+\.\d+)/);
    if (match) {
      const level = parseFloat(match[1]);
      this.onDataCallback(level);
    }
  }
}

export default SerialReader;
