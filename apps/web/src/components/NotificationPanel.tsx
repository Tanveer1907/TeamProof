import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  X,
  FileCheck2,
  ListTodo,
  AlertTriangle,
  FolderGit2,
  Calendar,
} from 'lucide-react';
import { INotification } from '@teamproof/shared';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: INotification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'task_assigned':
      case 'task_overdue':
      case 'task_due_soon':
        return <ListTodo className="w-4 h-4 text-[#7654DC]" />;
      case 'evidence_submitted':
      case 'evidence_verified':
      case 'evidence_changes_requested':
      case 'review_request':
        return <FileCheck2 className="w-4 h-4 text-[#16865C]" />;
      case 'milestone_approaching':
        return <Calendar className="w-4 h-4 text-[#D98B28]" />;
      default:
        return <Bell className="w-4 h-4 text-[#7654DC]" />;
    }
  };

  const handleNotificationClick = (n: INotification) => {
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
      <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-white dark:bg-[#161B22] rounded-2xl shadow-xl border border-[#E1E4EC] dark:border-[#30363D] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 border-b border-[#E1E4EC] dark:border-[#30363D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[#242438] dark:text-[#F0F6FC]">Notifications</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#F0EAFF] text-[#7654DC] dark:bg-[#7654DC]/20 dark:text-[#F0EAFF]">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs font-semibold text-[#7654DC] hover:text-[#6543C5] dark:text-[#F0EAFF] flex items-center gap-1 transition"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-[#E1E4EC] dark:divide-[#30363D]">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`p-3.5 hover:bg-[#F7F8FC] dark:hover:bg-[#21262D] transition cursor-pointer flex items-start gap-3 ${
                  !n.read ? 'bg-[#F0EAFF]/30 dark:bg-[#7654DC]/10' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#21262D] flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-xs text-[#242438] dark:text-[#F0F6FC] truncate">
                      {n.title}
                    </span>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-[#7654DC] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[#62677A] dark:text-[#8B949E] mt-0.5 line-clamp-2 leading-relaxed">
                    {n.description}
                  </p>
                  <span className="text-[10px] text-[#8E94A5] dark:text-[#6E7681] mt-1 block">
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
            <div className="p-8 text-center text-xs text-gray-400 dark:text-gray-500">
              <Bell className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2 opacity-50" />
              <span>You're all caught up. No notifications.</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
