
const log = require('electron-log');
const { collectMetricsAfterOptimization } = require('../metrics');
const { cleanupTemporaryFiles } = require('./cleanupOptimization');
const { optimizeNetworkSettings } = require('./networkOptimization');
const { stopBrowserBackgroundProcesses } = require('./browserOptimization');
const { disableUnnecessaryServices } = require('./serviceOptimization');
const { optimizeProcessPriorities } = require('./processOptimization');
const { optimizeStartup } = require('./startupOptimization');
const { enableGamingMode } = require('./gamingOptimization');
const { applyPrivacySettings } = require('./privacyOptimization');

// Запуск оптимизаций на основе выбранных настроек
async function runOptimizations(settings) {
  const results = [];
  
  // Очистка временных файлов
  if (settings.cleanup) {
    const cleanupSuccess = await cleanupTemporaryFiles();
    if (cleanupSuccess) {
      results.push('Временные файлы успешно очищены');
    } else {
      results.push('Ошибка при очистке временных файлов');
    }
  }
  
  // Оптимизация сетевых настроек
  if (settings.network) {
    const networkSuccess = await optimizeNetworkSettings();
    if (networkSuccess) {
      results.push('Сетевые настройки успешно оптимизированы');
    } else {
      results.push('Ошибка при оптимизации сети');
    }
  }
  
  // Отключение фоновых процессов браузеров
  if (settings.browsers) {
    const browsersSuccess = await stopBrowserBackgroundProcesses();
    if (browsersSuccess) {
      results.push('Фоновые процессы браузеров успешно остановлены');
    } else {
      results.push('Ошибка при остановке процессов браузеров');
    }
  }
  
  // Отключение неиспользуемых служб
  if (settings.services) {
    const servicesSuccess = await disableUnnecessaryServices();
    if (servicesSuccess) {
      results.push('Неиспользуемые службы успешно отключены');
    } else {
      results.push('Ошибка при отключении служб');
    }
  }
  
  // Настройка приоритетов процессов
  if (settings.priority) {
    const prioritySuccess = await optimizeProcessPriorities();
    if (prioritySuccess) {
      results.push('Приоритеты процессов успешно настроены');
    } else {
      results.push('Ошибка при настройке приоритетов');
    }
  }
  
  // Оптимизация автозагрузки
  if (settings.startup) {
    const startupSuccess = await optimizeStartup();
    if (startupSuccess) {
      results.push('Автозагрузка успешно оптимизирована');
    } else {
      results.push('Ошибка при оптимизации автозагрузки');
    }
  }
  
  // Игровой режим
  if (settings.gaming) {
    const gamingSuccess = await enableGamingMode();
    if (gamingSuccess) {
      results.push('Игровой режим успешно активирован');
    } else {
      results.push('Ошибка при активации игрового режима');
    }
  }
  
  // Настройки конфиденциальности
  if (settings.privacy) {
    const privacySuccess = await applyPrivacySettings();
    if (privacySuccess) {
      results.push('Настройки конфиденциальности успешно применены');
    } else {
      results.push('Ошибка при настройке конфиденциальности');
    }
  }
  
  // Собираем метрики после оптимизации для сравнения
  const improvements = await collectMetricsAfterOptimization();
  
  return {
    results,
    improvements
  };
}

module.exports = {
  runOptimizations
};
