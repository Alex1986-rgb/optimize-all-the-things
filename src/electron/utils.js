
const { exec } = require('child_process');
const { app } = require('electron');
const log = require('electron-log');
const fs = require('fs');
const shell = require('electron').shell;

// Проверка на запуск с админ правами
function isAdmin() {
  try {
    fs.accessSync('C:\\Windows\\system32\\config', fs.constants.W_OK);
    return true;
  } catch (err) {
    return false;
  }
}

// Перезапуск приложения с правами администратора
function restartAsAdmin() {
  const appPath = app.getPath('exe');
  
  exec(`powershell -Command "Start-Process -Verb RunAs '${appPath}'"`, (error) => {
    if (error) {
      log.error('Ошибка перезапуска с правами администратора:', error);
      return;
    }
    app.exit(0);
  });
}

// Показать файл логов
function showLogs() {
  const logFilePath = log.transports.file.getFile().path;
  shell.showItemInFolder(logFilePath);
}

module.exports = {
  isAdmin,
  restartAsAdmin,
  showLogs
};
