
const { app, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const { getMainWindow } = require('./window');

// Проверка обновлений
function checkForUpdates() {
  const mainWindow = getMainWindow();

  autoUpdater.checkForUpdatesAndNotify().then(() => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Обновления',
      message: 'Проверка обновлений',
      detail: 'Ваша версия программы актуальна.\nWindows Optimizer Pro v' + app.getVersion(),
      buttons: ['OK']
    });
  }).catch(err => {
    log.error('Ошибка при проверке обновлений:', err);
    dialog.showMessageBox({
      type: 'error',
      title: 'Ошибка обновления',
      message: 'Ошибка при проверке обновлений',
      detail: err.message,
      buttons: ['OK']
    });
  });
}

// Настройка обработчиков автообновления
function setupUpdaterHandlers() {
  const mainWindow = getMainWindow();
  
  autoUpdater.on('update-available', () => {
    if (mainWindow) {
      mainWindow.webContents.send('update-available');
    }
  });
  
  autoUpdater.on('update-downloaded', () => {
    if (mainWindow) {
      mainWindow.webContents.send('update-downloaded');
      
      dialog.showMessageBox({
        type: 'info',
        title: 'Доступно обновление',
        message: 'Новая версия Windows Optimizer Pro была загружена. Перезапустить приложение для установки обновления?',
        buttons: ['Перезапустить', 'Позже']
      }).then((returnValue) => {
        if (returnValue.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
    }
  });
}

module.exports = {
  checkForUpdates,
  setupUpdaterHandlers
};
