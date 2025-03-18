const express = require('express');
const { Client } = require('ssh2');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(cors({
  origin: '*',  // Be more restrictive in production
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));


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
app.post
app.post('/open', (req, res) => {
  const { host, port, username, password, path } = req.body;
  let hasResponded = false;
  
  const conn = new Client();
  
  conn.on('ready', () => {
    conn.sftp((err, sftp) => {
      if (err) {
        if (!hasResponded) {
          hasResponded = true;
          conn.end();
          return res.status(500).json({ error: err.message });
        }
      }

      const readStream = sftp.createReadStream(path);
      let data = '';

      readStream.on('data', (chunk) => {
        data += chunk;
      });

      readStream.on('end', () => {
        if (!hasResponded) {
          hasResponded = true;
          conn.end();
          res.send(data);
        }
      });

      readStream.on('error', (error) => {
        if (!hasResponded) {
          hasResponded = true;
          conn.end();
          res.status(500).json({ error: error.message });
        }
      });
    });
  });

  conn.on('error', (err) => {
    if (!hasResponded) {
      hasResponded = true;
      res.status(500).json({ error: err.message });
    }
  });

  conn.connect({
    host,
    port,
    username,
    password
  });
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {  // Changed this line
  console.log(`Server running on port ${PORT}`);
});