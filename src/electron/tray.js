
const { Menu, Tray } = require('electron');
const path = require('path');
const { getMainWindow } = require('./window');
const { checkForUpdates } = require('./updater');
const { showLogs, restartAsAdmin } = require('./utils');

let tray = null;

// Создаем системный трей
function createTray(appInfo, isQuitting, app) {
  tray = new Tray(path.join(__dirname, '../../resources/icon.ico'));
  
  const contextMenu = Menu.buildFromTemplate([
    { label: `${appInfo.name} v${appInfo.version}`, enabled: false },
    { type: 'separator' },
    { label: 'Открыть Windows Optimizer', click: () => getMainWindow().show() },
    { label: 'Проверить обновления', click: checkForUpdates },
    { label: 'Показать журнал', click: showLogs },
    { type: 'separator' },
    { label: 'Перезапустить от имени администратора', click: restartAsAdmin },
    { label: 'Выход', click: () => {
        isQuitting.value = true;
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip(`${appInfo.name} v${appInfo.version}`);
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    getMainWindow().show();
  });
  
  return tray;
}

module.exports = {
  createTray
};
