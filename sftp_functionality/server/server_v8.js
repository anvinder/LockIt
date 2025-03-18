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




app.get('/download', (req, res) => {
  const { path, host, port, username, password } = req.query;
  
  console.log('Download request received:', {
    path,
    host,
    port,
    username,
    hasPassword: !!password
  });

  if (!path || !host || !port || !username || !password) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const conn = new Client();
  
  conn.on('ready', () => {
    conn.sftp((err, sftp) => {
      if (err) {
        console.error('SFTP Error:', err);
        return res.status(500).json({ error: err.message });
      }

      console.log('Attempting to download:', path);
      
      const readStream = sftp.createReadStream(path);
      
      readStream.on('error', (error) => {
        console.error('Read stream error:', error);
        conn.end();
        if (!res.headersSent) {
          res.status(500).json({ error: error.message });
        }
      });

      // Set content disposition to attachment
      res.setHeader('Content-Disposition', `attachment; filename="${path.split('/').pop()}"`);
      
      readStream.pipe(res);
      
      res.on('finish', () => {
        console.log('Download completed');
        conn.end();
      });
    });
  });

  conn.on('error', (err) => {
    console.error('Connection error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  });

  conn.connect({
    host,
    port: parseInt(port),
    username,
    password
  });
});


app.post('/delete', (req, res) => {
  const { host, port, username, password, path, type } = req.body;
  
  console.log('Delete request:', { path, type });

  const conn = new Client();
  
  conn.on('ready', () => {
    conn.sftp((err, sftp) => {
      if (err) {
        console.error('SFTP Error:', err);
        conn.end();
        return res.status(500).json({ error: err.message });
      }

      const deleteItem = () => {
        if (type === 'directory') {
          sftp.rmdir(path, (err) => {
            conn.end();
            if (err) {
              console.error('Delete directory error:', err);
              return res.status(500).json({ error: err.message });
            }
            res.json({ success: true });
          });
        } else {
          sftp.unlink(path, (err) => {
            conn.end();
            if (err) {
              console.error('Delete file error:', err);
              return res.status(500).json({ error: err.message });
            }
            res.json({ success: true });
          });
        }
      };

      deleteItem();
    });
  });

  conn.on('error', (err) => {
    console.error('Connection error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  });

  conn.connect({
    host,
    port: parseInt(port),
    username,
    password
  });
});

// Replace your existing /file/* endpoint with this:
app.get('/file', (req, res) => {
  const { path, host, port, username, password } = req.query;
  
  console.log('Image request received:', {
    path,
    host,
    port,
    username,
    hasPassword: !!password
  });

  if (!path || !host || !port || !username || !password) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const conn = new Client();
  
  conn.on('ready', () => {
    console.log('SSH Connected');
    conn.sftp((err, sftp) => {
      if (err) {
        console.error('SFTP Error:', err);
        return res.status(500).json({ error: err.message });
      }

      console.log('Attempting to read:', path);
      
      sftp.stat(path, (statErr, stats) => {
        if (statErr) {
          console.error('File stat error:', statErr);
          conn.end();
          return res.status(404).json({ error: 'File not found' });
        }

        const readStream = sftp.createReadStream(path);
        
        readStream.on('error', (error) => {
          console.error('Read stream error:', error);
          conn.end();
          if (!res.headersSent) {
            res.status(500).json({ error: error.message });
          }
        });

        // Set appropriate headers
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Content-Length', stats.size);
        
        readStream.pipe(res);
        
        res.on('finish', () => {
          console.log('Transfer completed');
          conn.end();
        });
      });
    });
  });

  conn.on('error', (err) => {
    console.error('Connection error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  });

  conn.connect({
    host,
    port: parseInt(port),
    username,
    password
  });
});






app.post('/create', (req, res) => {
  const { host, port, username, password, path, type } = req.body;
  
  console.log('Create request received:', {
    path,
    type,
    host,
    port,
    username,
    hasPassword: !!password
  });

  const conn = new Client();
  
  conn.on('ready', () => {
    conn.sftp((err, sftp) => {
      if (err) {
        console.error('SFTP Error:', err);
        conn.end();
        return res.status(500).json({ error: err.message });
      }

      if (type === 'directory') {
        // Create directory
        sftp.mkdir(path, (err) => {
          conn.end();
          if (err) {
            console.error('Mkdir error:', err);
            return res.status(500).json({ error: err.message });
          }
          res.json({ success: true });
        });
      } else if (type === 'file') {
        // Create empty file
        const writeStream = sftp.createWriteStream(path);
        
        writeStream.on('error', (error) => {
          console.error('Write stream error:', error);
          conn.end();
          if (!res.headersSent) {
            res.status(500).json({ error: error.message });
          }
        });

        writeStream.on('finish', () => {
          conn.end();
          if (!res.headersSent) {
            res.json({ success: true });
          }
        });

        // Write empty content and close the stream
        writeStream.end('');
      } else {
        conn.end();
        res.status(400).json({ error: 'Invalid type. Must be "file" or "directory"' });
      }
    });
  });

  conn.on('error', (err) => {
    console.error('Connection error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  });

  conn.connect({
    host,
    port: parseInt(port),
    username,
    password
  });
});




app.post('/rename', (req, res) => {
  const { host, port, username, password, oldPath, newPath } = req.body;
  
  console.log('Rename request:', { oldPath, newPath });

  const conn = new Client();
  
  conn.on('ready', () => {
    conn.sftp((err, sftp) => {
      if (err) {
        console.error('SFTP Error:', err);
        conn.end();
        return res.status(500).json({ error: err.message });
      }

      sftp.rename(oldPath, newPath, (err) => {
        conn.end();
        if (err) {
          console.error('Rename error:', err);
          return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
      });
    });
  });

  conn.on('error', (err) => {
    console.error('Connection error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  });

  conn.connect({
    host,
    port: parseInt(port),
    username,
    password
  });
});





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