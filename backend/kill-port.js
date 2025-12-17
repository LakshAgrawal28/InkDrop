// Kill process using port 5000 before starting server
const { exec } = require('child_process');
const port = process.env.PORT || 5000;

console.log(`Checking for processes on port ${port}...`);

// Windows command to find and kill process
const findCommand = process.platform === 'win32'
  ? `netstat -ano | findstr :${port}`
  : `lsof -ti:${port}`;

exec(findCommand, (error, stdout) => {
  if (error || !stdout) {
    console.log(`✓ Port ${port} is free`);
    return;
  }

  // Extract PID from output
  let pid;
  if (process.platform === 'win32') {
    const lines = stdout.trim().split('\n');
    const match = lines[0].match(/\s+(\d+)\s*$/);
    if (match) pid = match[1];
  } else {
    pid = stdout.trim();
  }

  if (pid) {
    console.log(`Found process ${pid} using port ${port}, killing it...`);
    const killCommand = process.platform === 'win32' 
      ? `taskkill /F /PID ${pid}` 
      : `kill -9 ${pid}`;
    
    exec(killCommand, (killError) => {
      if (killError) {
        console.error(`Failed to kill process: ${killError.message}`);
      } else {
        console.log(`✓ Process ${pid} killed successfully`);
      }
    });
  }
});
