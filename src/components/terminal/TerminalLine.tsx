
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface TerminalLineProps {
  content: string;
  color?: 'default' | 'cyan' | 'green' | 'red' | 'yellow';
  delay?: number;
  isCommand?: boolean;
}

const TerminalLine: React.FC<TerminalLineProps> = ({ 
  content, 
  color = 'default',
  isCommand = false 
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(isCommand);
  
  useEffect(() => {
    if (isCommand) {
      let i = 0;
      const typingSpeed = 30; // ms per character
      
      const typingInterval = setInterval(() => {
        if (i < content.length) {
          setDisplayText(content.substring(0, i + 1));
          i++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
        }
      }, typingSpeed);
      
      return () => clearInterval(typingInterval);
    } else {
      setDisplayText(content);
    }
  }, [content, isCommand]);
  
  const colorClasses = {
    default: 'text-gray-200',
    cyan: 'text-cyan-400',
    green: 'text-green-400',
    red: 'text-red-500',
    yellow: 'text-yellow-400'
  };

  return (
    <div className={cn(
      'font-mono text-sm md:text-base leading-relaxed break-words',
      colorClasses[color],
      isCommand ? 'pl-6 relative before:content-["PS>"] before:text-green-400 before:absolute before:left-0' : '',
    )}>
      {displayText}
      {isTyping && <span className="animate-pulse">_</span>}
    </div>
  );
};

export default TerminalLine;
