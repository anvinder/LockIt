const express = require('express');
const { Client } = require('ssh2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/connect', (req, res) => {
  const { host, port, username, password } = req.body;
  
  const conn = new Client();
  
  conn.on('ready', () => {
    conn.end();
    res.json({ success: true });
  }).on('error', (err) => {
    res.status(500).json({ error: err.message });
  }).connect({
    host,
    port,
    username,
    password
  });
});

app.post('/ls', (req, res) => {
  const { host, port, username, password, path } = req.body;
  
  const conn = new Client();
  
  conn.on('ready', () => {
    conn.exec(`ls -la "${path}"`, (err, stream) => {
      if (err) {
        conn.end();
        return res.status(500).json({ error: err.message });
      }
      
      let data = '';
      stream.on('data', (chunk) => {
        data += chunk;
      }).on('end', () => {
        conn.end();
        
        // Parse ls output into file objects
        const files = data
          .split('\n')
          .slice(1) // Skip total line
          .filter(line => line.trim() && !line.endsWith('.') && !line.endsWith('..'))
          .map(line => {
            const parts = line.split(/\s+/);
            const name = parts.slice(8).join(' ');
            const isDirectory = line[0] === 'd';
            const size = parts[4];
            const modified = `${parts[5]} ${parts[6]} ${parts[7]}`;
            
            return {
              name,
              type: isDirectory ? 'directory' : 'file',
              size,
              modified
            };
          });
          
        res.json(files);
      });
    });
  }).on('error', (err) => {
    res.status(500).json({ error: err.message });
  }).connect({
    host,
    port,
    username,
    password
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});