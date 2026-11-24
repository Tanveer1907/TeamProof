import React, { useState, useEffect } from 'react';
import {
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Calendar,
  User as UserIcon,
  Layers,
  ChevronRight,
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
    { title: 'To Do', status: 'To Do', color: 'bg-gray-100 text-gray-700', count: 0 },
    { title: 'In Progress', status: 'In Progress', color: 'bg-blue-100 text-blue-700', count: 0 },
    { title: 'In Review', status: 'In Review', color: 'bg-amber-100 text-amber-700', count: 0 },
    { title: 'Verified', status: 'Verified', color: 'bg-emerald-100 text-emerald-700', count: 0 },
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
    <div className="space-y-6">
      {/* Top Header matching Slide 10 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#242438] tracking-tight">Tasks & milestones</h1>
          <p className="text-sm text-[#62677A] mt-0.5">
            {project?.title || 'CampusConnect'} • <span className="font-medium text-[#7654DC]">Registration milestone</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center -space-x-1.5 overflow-hidden">
            {members.map((m: any) => (
              <div
                key={m._id}
                title={m.name}
                className="w-7 h-7 rounded-full bg-[#F0EAFF] text-[#7654DC] font-semibold text-xs flex items-center justify-center border-2 border-white shadow-sm"
              >
                {m.avatar || m.name.substring(0, 2).toUpperCase()}
              </div>
            ))}
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#7654DC] hover:bg-[#6543C5] text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New task</span>
          </button>
        </div>
      </div>

      {/* Controls: Search & Filters */}
      <div className="bg-white p-3 rounded-xl border border-[#E1E4EC] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks by ID or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#E1E4EC] focus:outline-none focus:border-[#7654DC]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-[#62677A] font-medium">Priority:</span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-xs rounded-lg border border-[#E1E4EC] px-2.5 py-1.5 focus:outline-none focus:border-[#7654DC] bg-white text-[#242438]"
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
            <div key={col.status} className="bg-[#F7F8FC] rounded-xl p-3 border border-[#E1E4EC] flex flex-col min-h-[480px]">
              <div className="flex items-center justify-between px-1 py-1 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#242438]">{col.title}</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${col.color}`}>
                    {col.count}
                  </span>
                </div>
                <button
                  onClick={() => setModalOpen(true)}
                  className="text-gray-400 hover:text-[#7654DC] p-1"
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
                        ? 'text-[#D94B4B] bg-red-50'
                        : t.priority === 'Medium'
                        ? 'text-[#D98B28] bg-amber-50'
                        : 'text-gray-500 bg-gray-50';

                    return (
                      <div
                        key={t._id}
                        onClick={() => {
                          setSelectedTask(t);
                          setDetailModalOpen(true);
                        }}
                        className="bg-white p-4 rounded-xl border border-[#E1E4EC] shadow-sm hover:border-[#7654DC] hover:shadow-md cursor-pointer transition flex flex-col justify-between gap-3 group"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-semibold text-[#7654DC]">{t.taskIdStr}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${priorityColor}`}>
                              {t.priority}
                            </span>
                          </div>
                          <h3 className="font-semibold text-xs text-[#242438] group-hover:text-[#7654DC] transition line-clamp-2">
                            {t.title}
                          </h3>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#F0F2F6] text-[11px] text-[#62677A]">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span>
                              {t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'No date'}
                            </span>
                          </div>
                          <div
                            title={t.assignee?.name || 'Unassigned'}
                            className="w-5 h-5 rounded-full bg-[#F0EAFF] text-[#7654DC] font-bold text-[10px] flex items-center justify-center border border-[#7654DC]/20"
                          >
                            {t.assignee?.avatar || t.assignee?.name?.substring(0, 2).toUpperCase() || '?'}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-32 border-2 border-dashed border-[#E1E4EC] rounded-xl flex items-center justify-center text-xs text-gray-400">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E1E4EC] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#E1E4EC]">
              <h2 className="text-base font-bold text-[#242438]">Create New Project Task</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 text-[#D94B4B] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTask} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#242438] mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement input validation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] focus:outline-none focus:border-[#7654DC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#242438] mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Outline the responsibilities and scope of this task..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] focus:outline-none focus:border-[#7654DC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#242438] mb-1">Assignee</label>
                  <select
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] focus:outline-none focus:border-[#7654DC] bg-white"
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
                  <label className="block text-xs font-semibold text-[#242438] mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] focus:outline-none focus:border-[#7654DC] bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#242438] mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] focus:outline-none focus:border-[#7654DC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#242438] mb-1">Acceptance Criteria</label>
                <input
                  type="text"
                  placeholder="e.g. Unit tests pass, PR reviewed, design matches token spec"
                  value={acceptanceCriteria}
                  onChange={(e) => setAcceptanceCriteria(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] focus:outline-none focus:border-[#7654DC]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E1E4EC]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#62677A] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#7654DC] hover:bg-[#6543C5] text-white shadow-sm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E1E4EC]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E4EC]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#7654DC]">{selectedTask.taskIdStr}</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs font-semibold text-[#242438]">{selectedTask.status}</span>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <h2 className="text-base font-bold text-[#242438]">{selectedTask.title}</h2>
                <p className="text-gray-600 mt-1 whitespace-pre-wrap">{selectedTask.description || 'No description provided.'}</p>
              </div>

              {selectedTask.acceptanceCriteria && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="font-semibold text-gray-700 block mb-1">Acceptance Criteria</span>
                  <p className="text-gray-600">{selectedTask.acceptanceCriteria}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-gray-600">
                <div>
                  <span className="font-semibold block text-gray-700">Assignee</span>
                  <span>{selectedTask.assignee?.name || 'Unassigned'}</span>
                </div>
                <div>
                  <span className="font-semibold block text-gray-700">Due Date</span>
                  <span>{selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'None'}</span>
                </div>
              </div>

              {/* Status Update Control */}
              <div className="pt-3 border-t border-[#E1E4EC]">
                <label className="block text-xs font-semibold text-[#242438] mb-1.5">Change Task Status</label>
                <div className="flex flex-wrap gap-2">
                  {['To Do', 'In Progress', 'In Review'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedTask._id, st)}
                      disabled={selectedTask.status === st}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                        selectedTask.status === st
                          ? 'bg-[#7654DC] text-white border-[#7654DC]'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 mt-2">
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
