import React, { useEffect, useState } from 'react';

interface NotificationProps {
  message: string | null;
}

export const Notification: React.FC<NotificationProps> = ({ message }) => {
  const [visible, setVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    if (message) {
      setCurrentMessage(message);
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'
      }`}
    >
      {currentMessage && (
        <div className="bg-stone-800/90 backdrop-blur-sm text-white text-sm font-semibold py-2 px-4 rounded-full shadow-lg">
          {currentMessage}
        </div>
      )}
    </div>
  );
};