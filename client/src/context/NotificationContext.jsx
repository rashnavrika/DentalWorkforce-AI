import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 'n1',
      title: 'Certification Expiry Alert',
      message: 'Dr. Elena Rostova\'s BLS & ACLS Certification expires in 11 days.',
      type: 'Warning',
      is_read: false,
      timestamp: '10 mins ago',
    },
    {
      id: 'n2',
      title: 'High Burnout Warning',
      message: 'Dr. Carlos Alvarez (Clinic MTR-03) reached a high burnout risk index of 79/100.',
      type: 'Urgent',
      is_read: false,
      timestamp: '25 mins ago',
    },
    {
      id: 'n3',
      title: 'AI Recommendation Ready',
      message: 'Candidate match evaluated for Chair 3 Root Canal appointment.',
      type: 'AI_Alert',
      is_read: false,
      timestamp: '1 hour ago',
    },
  ]);

  const addNotification = (title, message, type = 'Info') => {
    const newNotif = {
      id: `n_${Date.now()}`,
      title,
      message,
      type,
      is_read: false,
      timestamp: 'Just now',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const clearAll = () => setNotifications([]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, markAsRead, clearAll, unreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
