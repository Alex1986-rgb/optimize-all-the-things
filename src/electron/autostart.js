
const { exec } = require('child_process');
const { app } = require('electron');
const log = require('electron-log');

// Установка/удаление автозагрузки
function setAutostart(enabled) {
  const appPath = app.getPath('exe');
  const regKey = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';
  
  if (enabled) {
    exec(`reg add "${regKey}" /v "Windows Optimizer Pro" /t REG_SZ /d "${appPath}" /f`, (error) => {
      if (error) {
        log.error('Ошибка при добавлении в автозагрузку:', error);
        return false;
      }
      return true;
    });
  } else {
    exec(`reg delete "${regKey}" /v "Windows Optimizer Pro" /f`, (error) => {
      if (error) {
        log.error('Ошибка при удалении из автозагрузки:', error);
        return false;
      }
      return true;
    });
  }
}

module.exports = {
  setAutostart
};
