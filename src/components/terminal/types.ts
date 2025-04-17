
export interface CommandLine {
  id: number;
  content: string;
  type: 'command' | 'output' | 'error' | 'success';
  color?: 'default' | 'cyan' | 'green' | 'red' | 'yellow';
  isCommand?: boolean;
}

export interface TerminalProps {
  settings: Record<string, boolean>;
  onComplete: () => void;
  onReset: () => void;
}

export interface OptimizationSettings {
  cleanup: boolean;
  network: boolean;
  browsers: boolean;
  services: boolean;
  priority: boolean;
  startup: boolean;
  gaming: boolean;
  privacy: boolean;
}
