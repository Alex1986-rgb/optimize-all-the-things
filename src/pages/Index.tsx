
import Terminal from "@/components/Terminal";
import { useEffect, useState } from "react";

const Index = () => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-800 p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-white text-center">
          Оптимизация Windows
        </h1>
        
        {isMounted && <Terminal />}
        
        <div className="mt-8 bg-gray-900 p-4 rounded text-gray-300 text-sm">
          <h2 className="font-bold text-lg mb-2 text-white">О программе</h2>
          <p className="mb-2">
            Эта утилита выполняет комплексную оптимизацию Windows для улучшения производительности и скорости работы.
          </p>
          <p className="mb-2">
            Включает в себя:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Оптимизацию сетевых параметров TCP/IP</li>
              <li>Отключение фоновой активности браузеров</li>
              <li>Очистку кэша и временных файлов</li>
              <li>Настройку приоритетов процессов</li>
              <li>Отключение ненужных служб Windows</li>
            </ul>
          </p>
          <p className="mt-4 text-yellow-400">
            Примечание: Это демонстрационная версия. В реальной системе потребовались бы права администратора.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
