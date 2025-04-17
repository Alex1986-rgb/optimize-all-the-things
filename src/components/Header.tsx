
import { Cpu, Settings, Monitor } from "lucide-react";

const Header = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center mb-8">
      <div className="flex items-center gap-3 mb-2">
        <Cpu size={28} className="text-cyan-400" />
        <h1 className="text-3xl md:text-4xl font-bold text-white text-center">
          Оптимизация Windows
        </h1>
        <Monitor size={28} className="text-cyan-400" />
      </div>
      <p className="text-gray-300 text-center max-w-lg">
        Интеллектуальная система для максимальной производительности вашего компьютера
      </p>
    </div>
  );
};

export default Header;
