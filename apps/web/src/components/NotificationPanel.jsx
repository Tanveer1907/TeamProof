import React from 'react';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderPlus,
  GitCommit,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotificationPanel = ({
  isOpen,
  onClose,
  notifications = [],
  unreadCount = 0,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNotificationClick = (notification) => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'verification_approved':
        return <CheckCircle2 className="w-4 h-4 text-[#15966A] dark:text-[#35B982]" />;
      case 'verification_rejected':
        return <AlertTriangle className="w-4 h-4 text-[#DC5555] dark:text-[#F07878]" />;
      case 'evidence_submitted':
        return <Clock className="w-4 h-4 text-[#D69E36] dark:text-[#E7B95D]" />;
      case 'git_synced':
        return <GitCommit className="w-4 h-4 text-[#15966A] dark:text-[#35B982]" />;
      case 'project_created':
        return <FolderPlus className="w-4 h-4 text-[#15966A] dark:text-[#35B982]" />;
      default:
        return <Bell className="w-4 h-4 text-[#15966A] dark:text-[#35B982]" />;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Dropdown Panel */}
      <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-white dark:bg-[#1B2022] rounded-2xl shadow-xl border border-[#DFE9E1] dark:border-[#30383A] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 border-b border-[#DFE9E1] dark:border-[#30383A] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[#172B21] dark:text-[#F1F5F3]">Notifications</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF6EE] text-[#15966A] dark:bg-[#133827] dark:text-[#35B982]">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs font-semibold text-[#15966A] hover:text-[#117A55] dark:text-[#35B982] dark:hover:text-[#4AC993] flex items-center gap-1 transition cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-[#84948A] hover:text-[#172B21] dark:text-[#858F8C] dark:hover:text-[#F1F5F3] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-[#DFE9E1] dark:divide-[#30383A]">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`p-3.5 hover:bg-[#F2F8F4] dark:hover:bg-[#2A3234] transition cursor-pointer flex items-start gap-3 ${
                  !n.read ? 'bg-[#EAF6EE]/60 dark:bg-[#22292B]' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#F2F8F4] dark:bg-[#22292B] flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-xs text-[#172B21] dark:text-[#F1F5F3] truncate">
                      {n.title}
                    </span>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-[#15966A] dark:bg-[#35B982] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[#52665A] dark:text-[#A5AFAB] mt-0.5 line-clamp-2 leading-relaxed">
                    {n.description}
                  </p>
                  <span className="text-[10px] text-[#84948A] dark:text-[#858F8C] mt-1 block">
                    {new Date(n.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-[#84948A] dark:text-[#858F8C]">
              <Bell className="w-8 h-8 text-[#84948A] dark:text-[#858F8C] mx-auto mb-2 opacity-50" />
              <span>You're all caught up. No notifications.</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
