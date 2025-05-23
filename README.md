
# Windows Optimizer Pro

Профессиональное приложение для оптимизации Windows и мониторинга производительности компьютера.

## Возможности

- Оптимизация сетевых параметров
- Отключение фоновой активности браузеров (Chrome, Firefox, Edge, Opera, Yandex)
- Очистка кэша и временных файлов
- Настройка приоритетов процессов
- Отключение ненужных служб Windows
- Мониторинг производительности системы в реальном времени
- Сравнение показателей до и после оптимизации
- Автоматические обновления
- Автозапуск при старте Windows (опционально)

## Установка и запуск

### Простая установка (Рекомендуется)
1. [Скачайте последнюю версию](https://github.com/kyrlanalexandr/windows-optimizer-pro/releases/latest/download/Windows-Optimizer-Pro-Setup.exe)
2. Запустите установщик и следуйте инструкциям
3. После установки запустите "Windows Optimizer Pro" с рабочего стола
4. Выберите параметры оптимизации и нажмите "Запустить"

**ВАЖНО**: Для корректной работы всех функций оптимизации приложение ОБЯЗАТЕЛЬНО должно запускаться с правами администратора.

## Системные требования

- Windows 10 (версия 1809 или новее) / Windows 11
- Процессор Intel или AMD с частотой не менее 2.0 ГГц
- 4 ГБ оперативной памяти
- 100 МБ свободного места на диске
- Права администратора

## Решение проблем

### Метрики не обновляются
- Убедитесь, что запустили приложение от имени администратора
- Перезапустите приложение
- Временно отключите антивирус

### Оптимизации не применяются
- Убедитесь, что запустили приложение от имени администратора
- Выбран хотя бы один параметр оптимизации
- Временно отключите антивирус

### Ошибка при запуске
- Установите последние обновления Windows
- Установите Visual C++ Redistributable (x64)
- Запустите от имени администратора

## Для разработчиков

```bash
# Клонировать репозиторий
git clone https://github.com/kyrlanalexandr/windows-optimizer-pro.git

# Установить зависимости
npm install

# Запустить в режиме разработки
npm run dev:electron

# Создать инсталлятор
npm run make
```

## О приложении

Разработчик: Kyrlan Alexandr

Создано при поддержке MyArredo https://www.myarredo.ru/

© 2025 Windows Optimizer Pro. Все права защищены.
