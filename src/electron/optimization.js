
const { ipcMain, dialog } = require('electron');
const log = require('electron-log');
const { runOptimizations } = require('./optimizations/optimizationController');

// Настройка обработчика для оптимизации
function setupOptimizationHandlers(mainWindow, isAdminFn, restartAsAdminFn) {
  // Обработчик для выполнения оптимизаций
  ipcMain.handle('run-optimization', async (event, settings) => {
    log.info('Running optimization with settings:', settings);
    
    // Проверяем наличие прав администратора
    if (!isAdminFn()) {
      log.warn('Attempting to run optimizations without admin rights');
      
      dialog.showMessageBox(mainWindow, {
        type: 'warning',
        title: 'Требуются права администратора',
        message: 'Для выполнения оптимизаций требуются права администратора',
        detail: 'Некоторые оптимизации могут не сработать без прав администратора. Хотите перезапустить приложение?',
        buttons: ['Продолжить без прав администратора', 'Перезапустить от имени администратора'],
        defaultId: 1
      }).then(({ response }) => {
        if (response === 1) {
          restartAsAdminFn();
        }
      });
      
      return {
        success: false,
        message: 'Для выполнения оптимизаций требуются права администратора.'
      };
    }
    
    try {
      const { results, improvements } = await runOptimizations(settings);
      
      log.info('Optimization completed with results:', results);
      log.info('Performance improvements:', improvements);
      
      return { 
        success: true, 
        message: 'Оптимизация успешно выполнена! ' + results.join('. '),
        improvements
      };
      
    } catch (error) {
      log.error('Error during optimization:', error);
      return { 
        success: false, 
        message: `Произошла ошибка при оптимизации: ${error.message}` 
      };
    }
  });
}

module.exports = {
  setupOptimizationHandlers,
  runOptimizations
};
