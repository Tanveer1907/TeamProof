import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  FileCheck2,
  ListTodo,
  Calendar,
  X,
} from 'lucide-react';

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

  const getIcon = (type) => {
    switch (type) {
      case 'task_assigned':
      case 'task_overdue':
      case 'task_due_soon':
        return <ListTodo className="w-4 h-4 text-[#15966A] dark:text-[#35B982]" />;
      case 'evidence_submitted':
      case 'evidence_verified':
      case 'evidence_changes_requested':
      case 'review_request':
        return <FileCheck2 className="w-4 h-4 text-[#15966A] dark:text-[#35B982]" />;
      case 'milestone_approaching':
        return <Calendar className="w-4 h-4 text-[#D69E36] dark:text-[#E7B95D]" />;
      default:
        return <Bell className="w-4 h-4 text-[#15966A] dark:text-[#35B982]" />;
    }
  };

  const handleNotificationClick = (n) => {
    if (!n.read) onMarkAsRead(n._id);
    onClose();
    if (n.linkUrl) {
      navigate(n.linkUrl);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Dropdown Panel */}
      <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-white dark:bg-[#17251D] rounded-2xl shadow-xl border border-[#DFE9E1] dark:border-[#2D4234] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 border-b border-[#DFE9E1] dark:border-[#2D4234] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[#172B21] dark:text-[#E8F3EB]">Notifications</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF6EE] text-[#15966A] dark:bg-[#1B3829] dark:text-[#35B982]">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs font-semibold text-[#15966A] hover:text-[#117A55] dark:text-[#35B982] dark:hover:text-[#4AC993] flex items-center gap-1 transition"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-[#84948A] hover:text-[#172B21] dark:text-[#849A8B] dark:hover:text-[#E8F3EB] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-[#DFE9E1] dark:divide-[#2D4234]">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`p-3.5 hover:bg-[#F2F8F4] dark:hover:bg-[#1E3025] transition cursor-pointer flex items-start gap-3 ${
                  !n.read ? 'bg-[#EAF6EE]/60 dark:bg-[#1B3829]/50' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#F2F8F4] dark:bg-[#1E3025] flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-xs text-[#172B21] dark:text-[#E8F3EB] truncate">
                      {n.title}
                    </span>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-[#15966A] dark:bg-[#35B982] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[#52665A] dark:text-[#B0C4B5] mt-0.5 line-clamp-2 leading-relaxed">
                    {n.description}
                  </p>
                  <span className="text-[10px] text-[#84948A] dark:text-[#849A8B] mt-1 block">
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
            <div className="p-8 text-center text-xs text-[#84948A] dark:text-[#849A8B]">
              <Bell className="w-8 h-8 text-[#84948A] dark:text-[#849A8B] mx-auto mb-2 opacity-50" />
              <span>You're all caught up. No notifications.</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
