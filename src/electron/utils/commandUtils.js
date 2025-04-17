
const { exec } = require('child_process');
const log = require('electron-log');

// Функция для выполнения PowerShell команды с повышенными привилегиями
async function runPowerShellCommand(command) {
  return new Promise((resolve, reject) => {
    const powershellCommand = `powershell -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -ExecutionPolicy Bypass -Command ${command.replace(/"/g, '\\"')}'"`;
    
    exec(powershellCommand, (error, stdout, stderr) => {
      if (error) {
        log.error(`PowerShell error: ${error}`);
        reject(error);
        return;
      }
      if (stderr) {
        log.warn(`PowerShell stderr: ${stderr}`);
      }
      log.info(`PowerShell command executed: ${command}`);
      log.info(`PowerShell stdout: ${stdout}`);
      resolve(stdout);
    });
  });
}

module.exports = {
  runPowerShellCommand
};
