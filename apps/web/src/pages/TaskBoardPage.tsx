import React, { useState, useEffect } from 'react';
import {
  Plus,
  Filter,
  Search,
  Clock,
  AlertCircle,
  X,
  Inbox,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const TaskBoardPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('');
  const [formError, setFormError] = useState('');

  const loadData = async () => {
    try {
      const projRes = await api.get('/projects');
      if (projRes.data.projects.length > 0) {
        const curProject = projRes.data.projects[0];
        setProject(curProject);

        const [tasksRes, membersRes] = await Promise.all([
          api.get(`/projects/${curProject._id}/tasks`),
          api.get(`/projects/${curProject._id}/members`),
        ]);
        setTasks(tasksRes.data.tasks);
        setMembers(membersRes.data.members.map((m: any) => m.user));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!title.trim()) {
      setFormError('Task title is required.');
      return;
    }

    try {
      await api.post(`/projects/${project._id}/tasks`, {
        title,
        description,
        assignee: assignee || undefined,
        priority,
        dueDate: dueDate || undefined,
        acceptanceCriteria,
      });

      setModalOpen(false);
      setTitle('');
      setDescription('');
      setAssignee('');
      setPriority('Medium');
      setDueDate('');
      setAcceptanceCriteria('');
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create task');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await api.patch(`/projects/${project._id}/tasks/${taskId}`, { status: newStatus });
      await loadData();
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update task status.');
    }
  };

  const columns: { title: string; status: string; color: string; count: number }[] = [
    { title: 'To Do', status: 'To Do', color: 'bg-[#EAF2EC] dark:bg-[#1E3025] text-[#52665A] dark:text-[#849A8B]', count: 0 },
    { title: 'In Progress', status: 'In Progress', color: 'bg-[#EEF6FD] dark:bg-[#152C3F] text-[#3985CF] dark:text-[#71B2EC]', count: 0 },
    { title: 'In Review', status: 'In Review', color: 'bg-[#FEF7EC] dark:bg-[#332714] text-[#D69E36] dark:text-[#E7B95D]', count: 0 },
    { title: 'Verified', status: 'Verified', color: 'bg-[#EAF6EE] dark:bg-[#1B3829] text-[#15966A] dark:text-[#35B982]', count: 0 },
  ];

  const filteredTasks = tasks.filter((t) => {
    const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
    const matchesSearch =
      searchQuery.trim() === '' ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.taskIdStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  columns.forEach((col) => {
    col.count = filteredTasks.filter((t) => t.status === col.status).length;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172B21] dark:text-[#E8F3EB] tracking-tight">Tasks & milestones</h1>
          <p className="text-sm text-[#52665A] dark:text-[#849A8B] mt-0.5">
            {project?.title || 'Project Workspace'} • <span className="font-medium text-[#15966A] dark:text-[#35B982]">{project?.title ? 'Sprint Board' : 'No active project'}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center -space-x-1.5 overflow-hidden">
            {members.map((m: any) => (
              <div
                key={m._id}
                title={m.name}
                className="w-7 h-7 rounded-full bg-[#EAF6EE] dark:bg-[#1B3829] text-[#15966A] dark:text-[#35B982] font-semibold text-xs flex items-center justify-center border-2 border-white dark:border-[#17251D] shadow-sm"
              >
                {m.avatar || m.name.substring(0, 2).toUpperCase()}
              </div>
            ))}
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#15966A] hover:bg-[#117A55] dark:bg-[#35B982] dark:hover:bg-[#4AC993] text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New task</span>
          </button>
        </div>
      </div>

      {/* Controls: Search & Filters */}
      <div className="bg-white dark:bg-[#17251D] p-3 rounded-xl border border-[#DFE9E1] dark:border-[#2D4234] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#84948A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks by ID or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#DFE9E1] dark:border-[#2D4234] bg-white dark:bg-[#101A15] text-[#172B21] dark:text-[#E8F3EB] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982] focus:ring-1 focus:ring-[#15966A] dark:focus:ring-[#35B982]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#84948A]" />
          <span className="text-xs text-[#52665A] dark:text-[#849A8B] font-medium">Priority:</span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-xs rounded-lg border border-[#DFE9E1] dark:border-[#2D4234] px-2.5 py-1.5 focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982] bg-white dark:bg-[#101A15] text-[#172B21] dark:text-[#E8F3EB]"
          >
            <option value="all">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.status);
          return (
            <div
              key={col.status}
              className="bg-[#F2F8F4] dark:bg-[#101A15] rounded-xl p-3 border border-[#DFE9E1] dark:border-[#2D4234] flex flex-col min-h-[480px] transition-colors"
            >
              <div className="flex items-center justify-between px-1 py-1 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#172B21] dark:text-[#E8F3EB]">{col.title}</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${col.color}`}>
                    {col.count}
                  </span>
                </div>
                <button
                  onClick={() => setModalOpen(true)}
                  className="text-[#84948A] hover:text-[#15966A] dark:hover:text-[#35B982] p-1 transition"
                  title="Add task"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tasks List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.length > 0 ? (
                  colTasks.map((t) => {
                    const priorityColor =
                      t.priority === 'High'
                        ? 'text-[#DC5555] dark:text-[#F07878] bg-red-50 dark:bg-red-950/30'
                        : t.priority === 'Medium'
                        ? 'text-[#D69E36] dark:text-[#E7B95D] bg-amber-50 dark:bg-amber-950/30'
                        : 'text-[#52665A] dark:text-[#849A8B] bg-[#EAF2EC] dark:bg-[#1E3025]';

                    return (
                      <div
                        key={t._id}
                        onClick={() => {
                          setSelectedTask(t);
                          setDetailModalOpen(true);
                        }}
                        className="bg-white dark:bg-[#17251D] p-4 rounded-xl border border-[#DFE9E1] dark:border-[#2D4234] shadow-sm hover:border-[#15966A] dark:hover:border-[#35B982] hover:shadow-md cursor-pointer transition flex flex-col justify-between gap-3 group"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-semibold text-[#15966A] dark:text-[#35B982]">{t.taskIdStr}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${priorityColor}`}>
                              {t.priority}
                            </span>
                          </div>
                          <h3 className="font-semibold text-xs text-[#172B21] dark:text-[#E8F3EB] group-hover:text-[#15966A] dark:group-hover:text-[#35B982] transition line-clamp-2">
                            {t.title}
                          </h3>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#DFE9E1] dark:border-[#2D4234] text-[11px] text-[#52665A] dark:text-[#849A8B]">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#84948A]" />
                            <span>
                              {t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'No date'}
                            </span>
                          </div>
                          <div
                            title={t.assignee?.name || 'Unassigned'}
                            className="w-5 h-5 rounded-full bg-[#EAF6EE] dark:bg-[#1B3829] text-[#15966A] dark:text-[#35B982] font-bold text-[10px] flex items-center justify-center border border-[#15966A]/20"
                          >
                            {t.assignee?.avatar || t.assignee?.name?.substring(0, 2).toUpperCase() || '?'}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-32 border-2 border-dashed border-[#DFE9E1] dark:border-[#2D4234] rounded-xl flex flex-col items-center justify-center text-xs text-[#84948A] dark:text-[#849A8B] gap-1">
                    <Inbox className="w-5 h-5 stroke-[1.5]" />
                    <span>No {col.title.toLowerCase()} tasks</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#17251D] rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#DFE9E1] dark:border-[#2D4234] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#DFE9E1] dark:border-[#2D4234]">
              <h2 className="text-base font-bold text-[#172B21] dark:text-[#E8F3EB]">Create New Project Task</h2>
              <button onClick={() => setModalOpen(false)} className="text-[#84948A] hover:text-[#172B21] dark:hover:text-[#E8F3EB]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-[#DC5555] dark:text-[#F07878] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTask} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#172B21] dark:text-[#E8F3EB] mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement input validation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#DFE9E1] dark:border-[#2D4234] bg-white dark:bg-[#101A15] text-[#172B21] dark:text-[#E8F3EB] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982] focus:ring-1 focus:ring-[#15966A] dark:focus:ring-[#35B982]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B21] dark:text-[#E8F3EB] mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Outline the responsibilities and scope of this task..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#DFE9E1] dark:border-[#2D4234] bg-white dark:bg-[#101A15] text-[#172B21] dark:text-[#E8F3EB] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982] focus:ring-1 focus:ring-[#15966A] dark:focus:ring-[#35B982]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#172B21] dark:text-[#E8F3EB] mb-1">Assignee</label>
                  <select
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#DFE9E1] dark:border-[#2D4234] bg-white dark:bg-[#101A15] text-[#172B21] dark:text-[#E8F3EB] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982]"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172B21] dark:text-[#E8F3EB] mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#DFE9E1] dark:border-[#2D4234] bg-white dark:bg-[#101A15] text-[#172B21] dark:text-[#E8F3EB] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982]"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B21] dark:text-[#E8F3EB] mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#DFE9E1] dark:border-[#2D4234] bg-white dark:bg-[#101A15] text-[#172B21] dark:text-[#E8F3EB] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B21] dark:text-[#E8F3EB] mb-1">Acceptance Criteria</label>
                <input
                  type="text"
                  placeholder="e.g. Unit tests pass, PR reviewed, design matches token spec"
                  value={acceptanceCriteria}
                  onChange={(e) => setAcceptanceCriteria(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#DFE9E1] dark:border-[#2D4234] bg-white dark:bg-[#101A15] text-[#172B21] dark:text-[#E8F3EB] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#DFE9E1] dark:border-[#2D4234]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#52665A] dark:text-[#849A8B] hover:bg-[#F2F8F4] dark:hover:bg-[#1E3025]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#15966A] hover:bg-[#117A55] dark:bg-[#35B982] dark:hover:bg-[#4AC993] text-white shadow-sm"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {detailModalOpen && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#17251D] rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#DFE9E1] dark:border-[#2D4234]">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFE9E1] dark:border-[#2D4234]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#15966A] dark:text-[#35B982]">{selectedTask.taskIdStr}</span>
                <span className="text-xs text-[#84948A]">•</span>
                <span className="text-xs font-semibold text-[#172B21] dark:text-[#E8F3EB]">{selectedTask.status}</span>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="text-[#84948A] hover:text-[#172B21] dark:hover:text-[#E8F3EB]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <h2 className="text-base font-bold text-[#172B21] dark:text-[#E8F3EB]">{selectedTask.title}</h2>
                <p className="text-[#52665A] dark:text-[#B0C4B5] mt-1 whitespace-pre-wrap">{selectedTask.description || 'No description provided.'}</p>
              </div>

              {selectedTask.acceptanceCriteria && (
                <div className="p-3 bg-[#F2F8F4] dark:bg-[#1E3025] rounded-lg border border-[#DFE9E1] dark:border-[#2D4234]">
                  <span className="font-semibold text-[#172B21] dark:text-[#E8F3EB] block mb-1">Acceptance Criteria</span>
                  <p className="text-[#52665A] dark:text-[#B0C4B5]">{selectedTask.acceptanceCriteria}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-[#52665A] dark:text-[#B0C4B5]">
                <div>
                  <span className="font-semibold block text-[#172B21] dark:text-[#E8F3EB]">Assignee</span>
                  <span>{selectedTask.assignee?.name || 'Unassigned'}</span>
                </div>
                <div>
                  <span className="font-semibold block text-[#172B21] dark:text-[#E8F3EB]">Due Date</span>
                  <span>{selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'None'}</span>
                </div>
              </div>

              {/* Status Update Control */}
              <div className="pt-3 border-t border-[#DFE9E1] dark:border-[#2D4234]">
                <label className="block text-xs font-semibold text-[#172B21] dark:text-[#E8F3EB] mb-1.5">Change Task Status</label>
                <div className="flex flex-wrap gap-2">
                  {['To Do', 'In Progress', 'In Review'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedTask._id, st)}
                      disabled={selectedTask.status === st}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                        selectedTask.status === st
                          ? 'bg-[#15966A] dark:bg-[#35B982] text-white border-[#15966A] dark:border-[#35B982]'
                          : 'bg-white dark:bg-[#1E3025] text-[#52665A] dark:text-[#B0C4B5] border-[#DFE9E1] dark:border-[#2D4234] hover:bg-[#F2F8F4] dark:hover:bg-[#263B2E]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[#84948A] dark:text-[#849A8B] mt-2">
                  * Note: Moving to 'Verified' is strictly governed by Evidence Verification per academic integrity rules.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default TaskBoardPage;
