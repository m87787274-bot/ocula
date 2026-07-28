
import React, { useState, useMemo, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { SavedScan, Campaign, VisibilityReport, KPI, ScheduledScan, ScryTemplate } from '../types';
import { generateAIFix, generateMissionTactics, analyzeBusinessVisibility } from '../services/aiService';
import { 
  Sparkles, Swords, Trash2, Target, Zap, ChevronLeft, ChevronDown, Plus, Filter, 
  AlertTriangle, X, CheckCircle2, Calendar, Clock, Play, Pause, RefreshCw, 
  Sliders, RotateCw, Building2, ShieldCheck, Activity, Edit3, Globe, MapPin, Radio, Loader2 
} from 'lucide-react';
import { BusinessNameInput } from './BusinessNameInput';

interface GlobalMissionControlProps {
  onBack: () => void;
  isDarkMode: boolean;
  onSelectScan: (report: VisibilityReport, id?: string) => void;
}

const focusModeDefs: Record<ScryTemplate, { name: string; icon: string; badge: string }> = {
  standard: { name: 'Standard Scry', icon: '⚡', badge: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' },
  competitor: { name: 'Rival Confrontation', icon: '⚔️', badge: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
  market: { name: 'Market Radar', icon: '📡', badge: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
  social: { name: 'Social Pulse', icon: '💬', badge: 'bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800' },
  gmb: { name: 'GMB & Local Maps', icon: '📍', badge: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
  sentiment: { name: 'Review Intelligence', icon: '💬', badge: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
  ai_readiness: { name: 'AI Search Readiness', icon: '🤖', badge: 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800' }
};

const GlobalMissionControl: React.FC<GlobalMissionControlProps> = ({ onBack, isDarkMode, onSelectScan }) => {
  const [activeTab, setActiveTab] = useState<'missions' | 'schedules'>('missions');
  const [scans, setScans] = useState<SavedScan[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [scheduledScans, setScheduledScans] = useState<ScheduledScan[]>([]);
  const [activeTactics, setActiveTactics] = useState<{ content: string | string[]; task: string; business: string } | null>(null);
  const [loadingTactics, setLoadingTactics] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'planned' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'weekly' | 'monthly' | 'active' | 'paused'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduledScan | null>(null);
  const [executingScheduleId, setExecutingScheduleId] = useState<string | null>(null);
  const [isExecutingAllDue, setIsExecutingAllDue] = useState(false);
  
  const [missionToDelete, setMissionToDelete] = useState<{ id: string; name: string } | null>(null);
  const [scheduleToDelete, setScheduleToDelete] = useState<ScheduledScan | null>(null);
  const [toastMessage, setToastMessage] = useState<{ title: string; body: string; type: 'success' | 'error' } | null>(null);

  const [newMission, setNewMission] = useState({
    scanId: '',
    targetCompetitor: '',
    name: '',
    objective: '',
    kpi: '',
    linkedKpiId: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    isVsMission: false,
    isRecurring: false,
    recurringFrequency: 'weekly' as 'weekly' | 'monthly',
    recurringStatus: 'active' as 'active' | 'paused' | 'error',
    deadline: new Date(Date.now() + 2592000000).toISOString().split('T')[0],
    targetMetrics: '',
    notes: '',
    assignee: '',
    dependencies: [] as string[]
  });

  const [scheduleForm, setScheduleForm] = useState<{
    id?: string;
    businessName: string;
    location: string;
    website: string;
    industry: string;
    companySize: string;
    focusMode: ScryTemplate;
    frequency: 'weekly' | 'monthly';
    status: 'active' | 'paused';
    autoMissionSync: boolean;
    notes: string;
  }>({
    businessName: '',
    location: '',
    website: '',
    industry: '',
    companySize: '',
    focusMode: 'standard',
    frequency: 'weekly',
    status: 'active',
    autoMissionSync: true,
    notes: ''
  });

  useEffect(() => {
    refreshScans();
    refreshSchedules();
    const fetchUser = async () => {
      const user = await storageService.getUser();
      if (user?.businessDetails?.kpis) {
        setKpis(user.businessDetails.kpis);
      }
    };
    fetchUser();
  }, []);

  const refreshScans = async () => {
    const latest = await storageService.getScans();
    setScans(latest);
    if (latest.length > 0 && !newMission.scanId) {
      setNewMission(prev => ({ ...prev, scanId: latest[0].id }));
    }
  };

  const refreshSchedules = async () => {
    const list = await storageService.getScheduledScans();
    setScheduledScans(list);
  };

  const uniqueCoreEntities = useMemo(() => {
    const map = new Map<string, { name: string; location?: string; website?: string; industry?: string; companySize?: string }>();
    scans.forEach(s => {
      if (s.businessName && !map.has(s.businessName.toLowerCase())) {
        map.set(s.businessName.toLowerCase(), {
          name: s.businessName,
          location: (s.report as any)?.businessDetails?.location || s.report?.profileBadge?.location,
          website: (s.report as any)?.businessDetails?.website || s.report?.website,
          industry: (s.report as any)?.businessDetails?.industry || s.report?.profileBadge?.industry,
          companySize: (s.report as any)?.businessDetails?.companySize
        });
      }
    });
    return Array.from(map.values());
  }, [scans]);

  const dueSchedules = useMemo(() => {
    const now = new Date();
    return scheduledScans.filter(s => s.status === 'active' && new Date(s.nextRunAt) <= now);
  }, [scheduledScans]);

  const filteredScheduledScans = useMemo(() => {
    let list = [...scheduledScans];
    
    if (scheduleFilter === 'weekly') {
      list = list.filter(s => s.frequency === 'weekly');
    } else if (scheduleFilter === 'monthly') {
      list = list.filter(s => s.frequency === 'monthly');
    } else if (scheduleFilter === 'active') {
      list = list.filter(s => s.status === 'active');
    } else if (scheduleFilter === 'paused') {
      list = list.filter(s => s.status === 'paused');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s => 
        s.businessName.toLowerCase().includes(q) ||
        (s.location && s.location.toLowerCase().includes(q)) ||
        (s.notes && s.notes.toLowerCase().includes(q))
      );
    }

    return list;
  }, [scheduledScans, scheduleFilter, searchQuery]);

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const getDeadlineColor = (deadline?: string, status?: string) => {
    if (!deadline) return 'text-slate-400 border-slate-100 dark:border-slate-800';
    if (status === 'completed') return 'text-emerald-500 border-emerald-100 dark:border-emerald-900/30';
    
    const date = new Date(deadline);
    const now = new Date();
    if (date < now) return 'text-rose-500 border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/10 font-black';
    
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 3) return 'text-amber-500 border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10 font-bold';
    return 'text-slate-500 border-slate-100 dark:border-slate-800';
  };

  const getRelativeDueString = (nextRunIso: string) => {
    const next = new Date(nextRunIso);
    const now = new Date();
    const diffTime = next.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`, isDue: true };
    if (diffDays === 0) return { text: 'Due Today', isDue: true };
    if (diffDays === 1) return { text: 'Due Tomorrow', isDue: false };
    return { text: `Due in ${diffDays} days`, isDue: false };
  };

  const openCreateScheduleModal = (entityName?: string) => {
    setEditingSchedule(null);
    const defaultName = entityName || (uniqueCoreEntities[0]?.name || scans[0]?.businessName || '');
    const matchedEntity = uniqueCoreEntities.find(e => e.name.toLowerCase() === defaultName.toLowerCase());

    setScheduleForm({
      businessName: defaultName,
      location: matchedEntity?.location || '',
      website: matchedEntity?.website || '',
      industry: matchedEntity?.industry || 'General',
      companySize: matchedEntity?.companySize || 'SMB',
      focusMode: 'standard',
      frequency: 'weekly',
      status: 'active',
      autoMissionSync: true,
      notes: ''
    });
    setShowScheduleModal(true);
  };

  const openEditScheduleModal = (schedule: ScheduledScan) => {
    setEditingSchedule(schedule);
    setScheduleForm({
      id: schedule.id,
      businessName: schedule.businessName,
      location: schedule.location || '',
      website: schedule.website || '',
      industry: schedule.industry || 'General',
      companySize: schedule.companySize || 'SMB',
      focusMode: schedule.focusMode || 'standard',
      frequency: schedule.frequency || 'weekly',
      status: schedule.status || 'active',
      autoMissionSync: schedule.autoMissionSync ?? true,
      notes: schedule.notes || ''
    });
    setShowScheduleModal(true);
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.businessName.trim()) return;

    const daysToAdd = scheduleForm.frequency === 'weekly' ? 7 : 30;
    const defaultNextRun = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString();

    const scheduleObj: ScheduledScan = {
      id: scheduleForm.id || 'sched_' + Math.random().toString(36).substr(2, 9),
      businessName: scheduleForm.businessName.trim(),
      location: scheduleForm.location.trim(),
      website: scheduleForm.website.trim(),
      industry: scheduleForm.industry.trim(),
      companySize: scheduleForm.companySize.trim(),
      focusMode: scheduleForm.focusMode,
      frequency: scheduleForm.frequency,
      status: scheduleForm.status,
      createdAt: editingSchedule?.createdAt || new Date().toISOString(),
      lastRunAt: editingSchedule?.lastRunAt,
      nextRunAt: editingSchedule?.nextRunAt || defaultNextRun,
      lastScore: editingSchedule?.lastScore,
      autoMissionSync: scheduleForm.autoMissionSync,
      notes: scheduleForm.notes.trim()
    };

    await storageService.saveScheduledScan(scheduleObj);
    await refreshSchedules();
    setShowScheduleModal(false);
    setToastMessage({
      title: editingSchedule ? 'Schedule Updated' : 'Recurring Scan Scheduled',
      body: `Automated ${scheduleObj.frequency} scan configured for "${scheduleObj.businessName}".`,
      type: 'success'
    });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleScheduleStatus = async (schedule: ScheduledScan) => {
    const updatedStatus = schedule.status === 'active' ? 'paused' : 'active';
    const updated = { ...schedule, status: updatedStatus as 'active' | 'paused' };
    await storageService.saveScheduledScan(updated);
    await refreshSchedules();
    setToastMessage({
      title: updatedStatus === 'active' ? 'Schedule Activated' : 'Schedule Paused',
      body: `Recurring scan for "${schedule.businessName}" is now ${updatedStatus}.`,
      type: 'success'
    });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExecuteScheduledScan = async (schedule: ScheduledScan) => {
    setExecutingScheduleId(schedule.id);
    try {
      const report = await analyzeBusinessVisibility(
        schedule.businessName,
        schedule.location || 'Global',
        schedule.website || '',
        schedule.focusMode,
        schedule.industry || 'General',
        schedule.companySize || 'SMB'
      );

      const score = report.overallScore || 75;
      await storageService.saveScan(schedule.businessName, score, report);

      const daysToAdd = schedule.frequency === 'weekly' ? 7 : 30;
      const nextRunAt = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString();

      const updatedSchedule: ScheduledScan = {
        ...schedule,
        lastRunAt: new Date().toISOString(),
        nextRunAt,
        lastScore: score
      };

      await storageService.saveScheduledScan(updatedSchedule);

      await storageService.addNotification({
        title: `Automated Scan Complete: ${schedule.businessName}`,
        message: `${schedule.frequency.toUpperCase()} scan completed with score ${score}/100.`,
        type: 'success'
      });

      await refreshScans();
      await refreshSchedules();

      setToastMessage({
        title: 'Scan Executed Successfully',
        body: `Updated report generated for ${schedule.businessName} (${score} PTS).`,
        type: 'success'
      });
    } catch (err: any) {
      setToastMessage({
        title: 'Scan Execution Failed',
        body: err?.message || 'Unable to complete automated visibility scan.',
        type: 'error'
      });
    } finally {
      setExecutingScheduleId(null);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleExecuteAllDueScans = async () => {
    if (dueSchedules.length === 0) return;
    setIsExecutingAllDue(true);
    for (const schedule of dueSchedules) {
      await handleExecuteScheduledScan(schedule);
    }
    setIsExecutingAllDue(false);
  };

  const handleDeleteSchedule = async () => {
    if (!scheduleToDelete) return;
    await storageService.deleteScheduledScan(scheduleToDelete.id);
    await refreshSchedules();
    setScheduleToDelete(null);
    setToastMessage({
      title: 'Schedule Removed',
      body: 'Recurring scan schedule deleted.',
      type: 'success'
    });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateProgress = async (campaignId: string, progress: number) => {
    await storageService.updateCampaignProgress(campaignId, progress);
    refreshScans();
  };

  const handleUpdateMissionStatus = async (scanId: string, campaignId: string, newStatus: 'active' | 'paused' | 'error' | 'planned' | 'completed') => {
    await storageService.updateCampaign(scanId, campaignId, { 
      status: newStatus,
      recurringStatus: (newStatus === 'active' || newStatus === 'paused' || newStatus === 'error') ? newStatus : undefined
    });
    await refreshScans();
    setToastMessage({
      title: 'Mission Status Updated',
      body: `Mission status updated to ${newStatus.toUpperCase()}.`,
      type: 'success'
    });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteMission = (campaignId: string, missionName: string) => {
    setMissionToDelete({ id: campaignId, name: missionName });
  };

  const aggregatedMissions = useMemo(() => {
    let missions: (Campaign & { businessName: string; report: VisibilityReport; scanId: string })[] = [];
    scans.forEach(scan => {
      (scan.report.campaigns || []).forEach(c => {
        missions.push({ 
          ...c, 
          progress: typeof c.progress === 'number' && !isNaN(c.progress) ? c.progress : 0,
          businessName: scan.businessName, 
          report: scan.report,
          scanId: scan.id
        });
      });
    });
    
    if (filter !== 'all') {
      missions = missions.filter(m => m.status === filter);
    }

    if (priorityFilter !== 'all') {
      missions = missions.filter(m => m.priority === priorityFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      missions = missions.filter(m => 
        (m.name || '').toLowerCase().includes(q) || 
        (m.objective || '').toLowerCase().includes(q) ||
        (m.businessName || '').toLowerCase().includes(q) ||
        (m.targetCompetitor && (m.targetCompetitor || '').toLowerCase().includes(q))
      );
    }

    return missions;
  }, [scans, filter, searchQuery]);

  const missionCounts = useMemo(() => {
    const allMissions: Campaign[] = [];
    scans.forEach(scan => {
      (scan.report.campaigns || []).forEach(c => allMissions.push(c));
    });
    return {
      all: allMissions.length,
      active: allMissions.filter(m => m.status === 'active').length,
      planned: allMissions.filter(m => m.status === 'planned').length,
      completed: allMissions.filter(m => m.status === 'completed').length,
    };
  }, [scans]);

  const selectedScanCompetitors = useMemo(() => {
    const scan = scans.find(s => s.id === newMission.scanId);
    return scan?.report.competitorComparison || [];
  }, [newMission.scanId, scans]);

  const handleCreateGlobalMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMission.scanId || !newMission.name || !newMission.objective) return;

    const mission: Campaign = {
      id: Math.random().toString(36).substr(2, 9),
      name: newMission.name,
      objective: newMission.objective,
      targetCompetitor: newMission.targetCompetitor,
      kpi: newMission.kpi || 'Market Resonance',
      linkedKpiId: newMission.linkedKpiId,
      priority: newMission.priority,
      status: newMission.isRecurring ? newMission.recurringStatus : 'active',
      progress: 0,
      deadline: newMission.deadline,
      isVsMission: !!newMission.targetCompetitor || newMission.isVsMission,
      isRecurring: newMission.isRecurring,
      recurringFrequency: newMission.isRecurring ? newMission.recurringFrequency : undefined,
      recurringStatus: newMission.isRecurring ? newMission.recurringStatus : undefined,
      targetMetrics: newMission.targetMetrics,
      notes: newMission.notes,
      assignee: newMission.assignee,
      dependencies: newMission.dependencies
    };

    await storageService.addCampaignToScan(newMission.scanId, mission);
    
    setNewMission({ 
      scanId: newMission.scanId,
      name: '', 
      objective: '', 
      kpi: '', 
      linkedKpiId: '',
      targetCompetitor: '', 
      priority: 'medium',
      isVsMission: false,
      isRecurring: false,
      recurringFrequency: 'weekly',
      recurringStatus: 'active',
      deadline: new Date(Date.now() + 2592000000).toISOString().split('T')[0],
      targetMetrics: '',
      notes: '',
      assignee: '',
      dependencies: []
    });
    
    setShowCreateModal(false);
    refreshScans();
    setToastMessage({ title: 'Mission Deployed', body: `"${mission.name}" has been successfully created.`, type: 'success' });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLaunchTactics = async (mission: Campaign, businessName: string) => {
    const subject = mission.targetCompetitor ? `${businessName} vs ${mission.targetCompetitor}` : businessName;
    setActiveTactics({ content: '', task: mission.name, business: subject });
    setLoadingTactics(true);
    try {
      const tactics = await generateMissionTactics(businessName, mission.objective, mission.name);
      setActiveTactics({ content: tactics, task: mission.name, business: subject });
    } catch (e) {
      try {
        const promptContext = mission.targetCompetitor 
          ? `Aggressive Visibility Strategy for ${businessName} specifically to outperform and displace rival ${mission.targetCompetitor}`
          : businessName;
        const plan = await generateAIFix(promptContext, mission.objective, mission.name);
        setActiveTactics({ content: plan, task: mission.name, business: subject });
      } catch (err) {
        setActiveTactics({ content: "Neural path blocked. Recalibrating competitive sensors...", task: mission.name, business: subject });
      }
    } finally {
      setLoadingTactics(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-5 animate-fadeIn space-y-4 pb-32">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-[500] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`p-4 rounded-xl shadow-lg border ${toastMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-200' : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-200'} flex items-start gap-3 max-w-sm`}>
            {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <div>
              <h4 className="text-sm font-bold">{toastMessage.title}</h4>
              <p className="text-xs opacity-90 mt-0.5">{toastMessage.body}</p>
            </div>
            <button onClick={() => setToastMessage(null)} className="ml-auto opacity-50 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {missionToDelete && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="surface w-full max-w-md rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95 duration-500">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <AlertTriangle className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Terminate Mission?</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                  Are you sure you want to permanently delete <span className="text-slate-900 dark:text-white font-black">"{missionToDelete.name}"</span>? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setMissionToDelete(null)}
                className="flex-1 btn-secondary btn-sm"
              >
                Abort
              </button>
              <button 
                onClick={async () => {
                  await storageService.deleteCampaign(missionToDelete.id);
                  refreshScans();
                  setMissionToDelete(null);
                  setToastMessage({ title: 'Mission Terminated', body: `"${missionToDelete.name}" has been permanently deleted.`, type: 'success' });
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="flex-1 btn-base bg-rose-500 text-white shadow-sm hover:bg-rose-600 btn-sm"
              >
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Tactics Modal */}
      {activeTactics && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-3xl animate-in fade-in duration-500">
          <div className="surface w-full max-w-2xl rounded-xl sm:rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-500">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center surface">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-slate-900">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">{activeTactics.task}</h3>
                </div>
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-11">{activeTactics.business}</p>
              </div>
              <button 
                onClick={() => setActiveTactics(null)} 
                className="btn-icon text-slate-300 hover:text-slate-900 dark:hover:text-white hover:rotate-90"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto bg-slate-50/30 dark:bg-slate-950/30">
              {loadingTactics ? (
                <div className="py-24 flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <div className="w-14 h-14 border-4 border-slate-200 dark:border-slate-700 border-t-slate-900 dark:border-t-white rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.4em]">Decoding Strategy...</p>
                    <p className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">Neural path synthesis in progress</p>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-10">
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    {Array.isArray(activeTactics.content) ? (
                      <ul className="space-y-4 list-none pl-0">
                        {activeTactics.content.map((step, idx) => (
                          <li key={`${step}-${idx}`} className="flex gap-4 items-start p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-colors group">
                            <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white flex items-center justify-center text-sm font-black shrink-0 mt-0.5 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900 transition-colors shadow-sm">
                              {idx + 1}
                            </div>
                            <span className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed text-base">{step}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 font-bold leading-relaxed text-lg sm:text-xl italic">
                        {activeTactics.content}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => setActiveTactics(null)} 
                    className="w-full btn-base bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 btn-xl"
                  >
                    Confirm Deployment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE MISSION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="surface w-full max-w-xl rounded-xl shadow-sm animate-in zoom-in-95 duration-500 border border-slate-200 dark:border-slate-800 overflow-hidden relative max-h-[90vh] flex flex-col">
             <div className="absolute top-0 left-0 w-full h-2 ocula-gradient-bg"></div>
             <div className="p-4 bg-slate-50/30 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Add Intelligence Mission</h3>
                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">Deploy New Growth Vector</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCreateModal(false)} 
                  className="btn-icon text-slate-300 hover:text-rose-500 hover:rotate-90"
                >
                  <X className="w-8 h-8" />
                </button>
             </div>
             <form onSubmit={handleCreateGlobalMission} className="p-4 space-y-4 overflow-y-auto">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Your Business (Mission Subject)</label>
                  <div className="relative">
                    <select 
                      value={newMission.scanId} 
                      onChange={e => setNewMission({...newMission, scanId: e.target.value, targetCompetitor: ''})}
                      className="w-full px-5 py-5 rounded-xl bg-slate-50 dark:bg-slate-800 outline-none font-bold text-lg appearance-none border border-slate-200 focus:border-indigo-500 dark:border-slate-700 dark:focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
                    >
                      {scans.length === 0 && <option value="">No Active Profiles Identified</option>}
                      {scans.map(s => (
                        <option key={s.id} value={s.id}>{s.businessName}</option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Zap className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Mission Scope</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setNewMission({...newMission, isVsMission: false, targetCompetitor: ''})}
                      className={`flex-1 btn-sm rounded-xl border gap-2 ${!newMission.isVsMission ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    >
                      <Zap className="w-4 h-4" />
                      Standard Growth
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewMission({...newMission, isVsMission: true})}
                      className={`flex-1 btn-sm rounded-xl border gap-2 ${newMission.isVsMission ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    >
                      <Swords className="w-4 h-4" />
                      Rival Confrontation
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Mission Codename</label>
                    <input required value={newMission.name} onChange={e => setNewMission({...newMission, name: e.target.value})} placeholder="e.g. Market Domination" className="w-full px-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 focus:border-indigo-500 dark:border-slate-700 dark:focus:border-indigo-500 outline-none font-bold text-sm transition-all text-slate-900 dark:text-white" />
                  </div>
                  {newMission.isVsMission && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-left-4">
                      <label className="text-[10px] font-black text-orange-400 uppercase tracking-widest ml-1">Target Rival</label>
                      <div className="relative">
                        <select 
                          required={newMission.isVsMission}
                          value={newMission.targetCompetitor} 
                          onChange={e => setNewMission({...newMission, targetCompetitor: e.target.value})}
                          className="w-full px-4 py-4 rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10 focus:border-orange-500 outline-none font-bold text-sm transition-all text-orange-900 dark:text-orange-100 appearance-none" 
                        >
                          <option value="">-- Select Target Rival --</option>
                          <option value="Global Average">Global Average</option>
                          <option value="Direct Market Leader">Direct Market Leader</option>
                          {selectedScanCompetitors.map(comp => (
                            <option key={comp.name} value={comp.name}>{comp.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-orange-400">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Strategic Objective</label>
                  <textarea required value={newMission.objective} onChange={e => setNewMission({...newMission, objective: e.target.value})} placeholder="Define the core tactical goal for this deployment..." className="w-full px-5 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 border border-slate-200 focus:border-indigo-500 dark:border-slate-700 dark:focus:border-indigo-500 outline-none font-bold text-sm h-28 transition-all resize-none text-slate-900 dark:text-white" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Urgency Matrix</label>
                    <div className="relative">
                      <select value={newMission.priority} onChange={e => setNewMission({...newMission, priority: e.target.value as any})} className="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 outline-none font-bold text-sm appearance-none border border-slate-200 focus:border-indigo-500 dark:border-slate-700 dark:focus:border-indigo-500 transition-all text-slate-900 dark:text-white">
                        <option value="high">Critical / High</option>
                        <option value="medium">Strategic / Medium</option>
                        <option value="low">Operational / Low</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Filter className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Success Metric (KPI)</label>
                    <div className="space-y-3">
                      {kpis.length > 0 && (
                        <div className="relative">
                          <select 
                            value={newMission.linkedKpiId} 
                            onChange={e => {
                              const kpiId = e.target.value;
                              const selectedKpi = kpis.find(k => k.id === kpiId);
                              if (selectedKpi) {
                                setNewMission({
                                  ...newMission,
                                  linkedKpiId: kpiId,
                                  kpi: `${selectedKpi.name} (Target: ${selectedKpi.target}${selectedKpi.unit || ''})`
                                });
                              } else {
                                setNewMission({ ...newMission, linkedKpiId: '', kpi: '' });
                              }
                            }}
                            className="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 outline-none font-bold text-sm appearance-none border border-slate-200 focus:border-indigo-500 dark:border-slate-700 dark:focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
                          >
                            <option value="">-- Custom Metric --</option>
                            {kpis.map(k => (
                              <option key={k.id} value={k.id}>Link KPI: {k.name}</option>
                            ))}
                          </select>
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <Plus className="w-3 h-3" />
                          </div>
                        </div>
                      )}
                      
                      <input 
                        value={newMission.kpi} 
                        onChange={e => setNewMission({...newMission, kpi: e.target.value, linkedKpiId: ''})} 
                        placeholder={newMission.linkedKpiId ? "KPI Linked (Editable)" : "e.g. +15% Reach"} 
                        className={`w-full px-5 py-4 rounded-xl border outline-none font-bold text-sm transition-all ${newMission.linkedKpiId ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 focus:border-indigo-500 dark:border-slate-700 dark:focus:border-indigo-500 text-slate-900 dark:text-white'}`} 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Target Metrics</label>
                    <input 
                      value={newMission.targetMetrics} 
                      onChange={e => setNewMission({...newMission, targetMetrics: e.target.value})} 
                      placeholder="e.g. 10,000 visitors" 
                      className="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 focus:border-indigo-500 dark:border-slate-700 dark:focus:border-indigo-500 outline-none font-bold text-sm transition-all text-slate-900 dark:text-white" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Assignee</label>
                    <input 
                      value={newMission.assignee} 
                      onChange={e => setNewMission({...newMission, assignee: e.target.value})} 
                      placeholder="e.g. John Doe" 
                      className="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 focus:border-indigo-500 dark:border-slate-700 dark:focus:border-indigo-500 outline-none font-bold text-sm transition-all text-slate-900 dark:text-white" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Dependencies</label>
                  <div className="relative">
                    <select
                      multiple
                      value={newMission.dependencies}
                      onChange={e => {
                        const options = Array.from(e.target.selectedOptions, option => option.value);
                        setNewMission({...newMission, dependencies: options});
                      }}
                      className="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 focus:border-indigo-500 dark:border-slate-700 dark:focus:border-indigo-500 outline-none font-bold text-sm transition-all text-slate-900 dark:text-white h-32"
                    >
                      {aggregatedMissions
                        .filter(m => m.scanId === newMission.scanId || !newMission.scanId)
                        .map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1 ml-1">Hold Ctrl/Cmd to select multiple dependencies.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Notes</label>
                  <textarea 
                    value={newMission.notes} 
                    onChange={e => setNewMission({...newMission, notes: e.target.value})} 
                    placeholder="Add any additional notes or details..." 
                    className="w-full px-5 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 border border-slate-200 focus:border-indigo-500 dark:border-slate-700 dark:focus:border-indigo-500 outline-none font-bold text-sm h-28 transition-all resize-none text-slate-900 dark:text-white" 
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <RotateCw className="w-3.5 h-3.5 text-indigo-500" /> Recurring Mission
                      </span>
                      <p className="text-[10px] text-slate-400">Automate recurring cadence & periodic feedback status for this mission.</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={newMission.isRecurring}
                      onChange={e => setNewMission({ ...newMission, isRecurring: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>

                  {newMission.isRecurring && (
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700/80">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Cadence</label>
                        <select
                          value={newMission.recurringFrequency}
                          onChange={e => setNewMission({ ...newMission, recurringFrequency: e.target.value as 'weekly' | 'monthly' })}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                        >
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Initial Status Badge</label>
                        <select
                          value={newMission.recurringStatus}
                          onChange={e => setNewMission({ ...newMission, recurringStatus: e.target.value as 'active' | 'paused' | 'error' })}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                        >
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                          <option value="error">Error</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Mission Deadline</label>
                  <input 
                    type="date" 
                    required
                    value={newMission.deadline} 
                    onChange={e => setNewMission({...newMission, deadline: e.target.value})} 
                    className="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 focus:border-indigo-500 dark:border-slate-700 dark:focus:border-indigo-500 outline-none font-bold text-sm transition-all text-slate-900 dark:text-white" 
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 btn-secondary btn-sm">Discard</button>
                  <button type="submit" className="flex-[2] btn-base bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 btn-sm">Deploy Objective</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* SCHEDULE RECURRING SCAN MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="surface w-full max-w-xl rounded-xl shadow-sm animate-in zoom-in-95 duration-500 border border-slate-200 dark:border-slate-800 overflow-hidden relative max-h-[90vh] flex flex-col">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500"></div>
            <div className="p-4 bg-slate-50/30 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {editingSchedule ? 'Edit Scan Schedule' : 'Schedule Recurring Scan'}
                  </h3>
                  <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">
                    Automated Weekly or Monthly Entity Audit
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowScheduleModal(false)} 
                className="btn-icon text-slate-300 hover:text-rose-500 hover:rotate-90"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="p-4 space-y-4 overflow-y-auto">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Core Business Entity</label>
                {uniqueCoreEntities.length > 0 && (
                  <div className="relative mb-2">
                    <select
                      value={scheduleForm.businessName}
                      onChange={e => {
                        const name = e.target.value;
                        const match = uniqueCoreEntities.find(u => u.name.toLowerCase() === name.toLowerCase());
                        setScheduleForm({
                          ...scheduleForm,
                          businessName: name,
                          location: match?.location || scheduleForm.location,
                          website: match?.website || scheduleForm.website,
                          industry: match?.industry || scheduleForm.industry,
                          companySize: match?.companySize || scheduleForm.companySize
                        });
                      }}
                      className="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-bold text-sm text-slate-900 dark:text-white"
                    >
                      {uniqueCoreEntities.map(e => (
                        <option key={e.name} value={e.name}>{e.name}</option>
                      ))}
                      <option value="">-- Custom Entity --</option>
                    </select>
                  </div>
                )}

                <BusinessNameInput
                  value={scheduleForm.businessName}
                  onChange={val => setScheduleForm({ ...scheduleForm, businessName: val })}
                  placeholder="Type business or entity name..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Scan Cadence</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setScheduleForm({ ...scheduleForm, frequency: 'weekly' })}
                      className={`py-3 px-3 rounded-xl border font-black text-xs flex flex-col items-center gap-1 transition-all ${
                        scheduleForm.frequency === 'weekly' 
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-300' 
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-emerald-500" />
                      Weekly (7 Days)
                    </button>
                    <button
                      type="button"
                      onClick={() => setScheduleForm({ ...scheduleForm, frequency: 'monthly' })}
                      className={`py-3 px-3 rounded-xl border font-black text-xs flex flex-col items-center gap-1 transition-all ${
                        scheduleForm.frequency === 'monthly' 
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300' 
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      <Clock className="w-4 h-4 text-indigo-500" />
                      Monthly (30 Days)
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Scan Focus Mode</label>
                  <select
                    value={scheduleForm.focusMode}
                    onChange={e => setScheduleForm({ ...scheduleForm, focusMode: e.target.value as ScryTemplate })}
                    className="w-full px-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 focus:border-indigo-500 dark:border-slate-700 dark:focus:border-indigo-500 outline-none font-bold text-sm text-slate-900 dark:text-white"
                  >
                    <option value="standard">⚡ Standard Scry (360° Audit)</option>
                    <option value="competitor">⚔️ Rival Confrontation</option>
                    <option value="market">📡 Market Demand Radar</option>
                    <option value="social">💬 Social Pulse & Sentiment</option>
                    <option value="gmb">📍 GMB & Local Maps</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Location / Target Market</label>
                  <input
                    value={scheduleForm.location}
                    onChange={e => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                    placeholder="e.g. San Francisco, CA or Global"
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-bold text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Website URL</label>
                  <input
                    value={scheduleForm.website}
                    onChange={e => setScheduleForm({ ...scheduleForm, website: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-bold text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Notes & Strategic Instructions</label>
                <textarea
                  value={scheduleForm.notes}
                  onChange={e => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                  placeholder="Specify key channels or metrics to monitor automatically..."
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-bold text-sm h-24 resize-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-black text-slate-900 dark:text-white">Auto-Notification Alerts</h5>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Generate app notification on automated report completion</p>
                </div>
                <button
                  type="button"
                  onClick={() => setScheduleForm({ ...scheduleForm, autoMissionSync: !scheduleForm.autoMissionSync })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${scheduleForm.autoMissionSync ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white shadow-sm transition-transform absolute top-1 ${scheduleForm.autoMissionSync ? 'left-7' : 'left-1'}`}></span>
                </button>
              </div>

              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setShowScheduleModal(false)} className="flex-1 btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="flex-[2] btn-base bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 btn-sm">
                  {editingSchedule ? 'Save Schedule' : 'Activate Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE SCHEDULE CONFIRMATION MODAL */}
      {scheduleToDelete && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="surface w-full max-w-md rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95 duration-500">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Remove Recurring Schedule?</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed text-sm">
                  Are you sure you want to stop automated scans for <span className="text-slate-900 dark:text-white font-black">"{scheduleToDelete.businessName}"</span>?
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setScheduleToDelete(null)} className="flex-1 btn-secondary btn-sm">Abort</button>
              <button 
                onClick={handleDeleteSchedule}
                className="flex-1 btn-base bg-rose-500 text-white shadow-sm hover:bg-rose-600 btn-sm"
              >
                Delete Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <button onClick={onBack} className="btn-ghost btn-xs text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 group">
              <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Return to Deck
            </button>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-display md:text-7xl font-medium text-slate-900 dark:text-white tracking-tighter leading-none">
              Mission <span className="text-slate-500 dark:text-slate-400 inline-block">Control.</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xl text-lg">Coordinate growth vectors and automated recurring visibility scans across core entities.</p>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex gap-4 pt-2">
            <button
              onClick={() => setActiveTab('missions')}
              className={`pb-2 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'missions'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Growth Vectors</span>
              <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {aggregatedMissions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('schedules')}
              className={`pb-2 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'schedules'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Recurring Entity Scans</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${dueSchedules.length > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-black animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                {scheduledScans.length}
              </span>
            </button>
          </div>
        </div>

        {/* Action Controls for Active Tab */}
        {activeTab === 'missions' ? (
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
            <div className="relative w-full md:w-64 group">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search missions..."
                className="w-full pl-12 pr-6 py-4 rounded-xl surface outline-none focus:border-indigo-500 transition-all font-bold text-sm shadow-sm"
              />
              <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex surface p-1.5 rounded-xl shadow-xl border border-slate-50 dark:border-slate-800 overflow-x-auto no-scrollbar max-w-full">
              {(['all', 'active', 'planned', 'completed'] as const).map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`btn-sm rounded-[1.5rem] whitespace-nowrap flex items-center gap-2 px-4 ${filter === f ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  <span className="capitalize">{f}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filter === f ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {missionCounts[f]}
                  </span>
                </button>
              ))}
            </div>

            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-base bg-slate-900 dark:bg-slate-800 text-white btn-lg shadow-sm border border-slate-800 whitespace-nowrap"
            >
              <Plus className="w-5 h-5 mr-3" />
              Add Global Mission
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
            <div className="relative w-full md:w-64 group">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search schedules..."
                className="w-full pl-12 pr-6 py-4 rounded-xl surface outline-none focus:border-emerald-500 transition-all font-bold text-sm shadow-sm"
              />
              <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex surface p-1.5 rounded-xl shadow-xl border border-slate-50 dark:border-slate-800 overflow-x-auto no-scrollbar max-w-full">
              {(['all', 'weekly', 'monthly', 'active', 'paused'] as const).map(sf => (
                <button 
                  key={sf}
                  onClick={() => setScheduleFilter(sf)}
                  className={`btn-sm rounded-[1.5rem] whitespace-nowrap px-4 capitalize ${scheduleFilter === sf ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  {sf}
                </button>
              ))}
            </div>

            <button 
              onClick={() => openCreateScheduleModal()}
              className="btn-base bg-emerald-600 hover:bg-emerald-700 text-white btn-lg shadow-sm whitespace-nowrap"
            >
              <Plus className="w-5 h-5 mr-2" />
              Schedule Recurring Scan
            </button>
          </div>
        )}
      </div>

      {/* RECURRING SCAN SCHEDULER VIEW */}
      {activeTab === 'schedules' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 surface rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Automated Entities</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{uniqueCoreEntities.length}</p>
              <p className="text-xs text-slate-500 mt-1">Core profiles tracked</p>
            </div>
            <div className="p-4 surface rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Schedules</p>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {scheduledScans.filter(s => s.status === 'active').length}
              </p>
              <p className="text-xs text-slate-500 mt-1">Running automatically</p>
            </div>
            <div className="p-4 surface rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Weekly Cadence</p>
              <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {scheduledScans.filter(s => s.frequency === 'weekly').length}
              </p>
              <p className="text-xs text-slate-500 mt-1">7-day interval audits</p>
            </div>
            <div className="p-4 surface rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Monthly Cadence</p>
              <p className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-1">
                {scheduledScans.filter(s => s.frequency === 'monthly').length}
              </p>
              <p className="text-xs text-slate-500 mt-1">30-day comprehensive audits</p>
            </div>
          </div>

          {/* Due Scans Action Banner */}
          {dueSchedules.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-black text-amber-800 dark:text-amber-200">
                    {dueSchedules.length} Recurring Scan{dueSchedules.length === 1 ? '' : 's'} Due for Execution
                  </h4>
                  <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
                    Entities are ready for scheduled weekly/monthly visibility recalibration.
                  </p>
                </div>
              </div>
              <button
                onClick={handleExecuteAllDueScans}
                disabled={isExecutingAllDue}
                className="btn-base bg-amber-500 text-slate-950 font-black btn-sm hover:bg-amber-400 shrink-0 flex items-center gap-2"
              >
                {isExecutingAllDue ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                Run All Due Scans
              </button>
            </div>
          )}

          {/* Scheduled Scans Cards Grid */}
          {filteredScheduledScans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredScheduledScans.map((schedule) => {
                const relativeDue = getRelativeDueString(schedule.nextRunAt);
                const isExecutingThis = executingScheduleId === schedule.id;
                const focusDef = focusModeDefs[schedule.focusMode] || focusModeDefs.standard;

                return (
                  <div 
                    key={schedule.id}
                    className="surface p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-all relative overflow-hidden group"
                  >
                    <div className="space-y-3">
                      {/* Top Entity Bar */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-emerald-500" />
                            <h4 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                              {schedule.businessName}
                            </h4>
                          </div>
                          {(schedule.location || schedule.website) && (
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                              {schedule.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {schedule.location}</span>}
                              {schedule.website && <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {schedule.website}</span>}
                            </p>
                          )}
                        </div>

                        {/* Status Switcher Button */}
                        <button
                          onClick={() => handleToggleScheduleStatus(schedule)}
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border transition-all ${
                            schedule.status === 'active'
                              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${schedule.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                          {schedule.status}
                        </button>
                      </div>

                      {/* Cadence & Focus Badges */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1 border ${
                          schedule.frequency === 'weekly' 
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                            : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                        }`}>
                          <Clock className="w-3 h-3" />
                          {schedule.frequency} cadence
                        </span>

                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border ${focusDef.badge}`}>
                          {focusDef.icon} {focusDef.name}
                        </span>
                      </div>

                      {/* Metrics / Schedule Status */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/80 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-bold">Last Run:</span>
                          <span className="font-black text-slate-800 dark:text-slate-200">
                            {schedule.lastRunAt ? new Date(schedule.lastRunAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never Executed'}
                          </span>
                        </div>
                        {schedule.lastScore !== undefined && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-bold">Latest Visibility:</span>
                            <span className="font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">
                              {schedule.lastScore} / 100 PTS
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-700">
                          <span className="text-slate-400 font-bold">Next Scan:</span>
                          <span className={`font-black flex items-center gap-1 ${relativeDue.isDue ? 'text-amber-500 animate-pulse' : 'text-slate-700 dark:text-slate-300'}`}>
                            <Calendar className="w-3 h-3" />
                            {new Date(schedule.nextRunAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ({relativeDue.text})
                          </span>
                        </div>
                      </div>

                      {schedule.notes && (
                        <p className="text-xs text-slate-500 italic line-clamp-2 bg-slate-50/50 dark:bg-slate-800/30 p-2 rounded-lg">
                          "{schedule.notes}"
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => handleExecuteScheduledScan(schedule)}
                        disabled={isExecutingThis}
                        className="flex-1 btn-base bg-emerald-600 hover:bg-emerald-700 text-white btn-sm shadow-sm flex items-center justify-center gap-1.5"
                      >
                        {isExecutingThis ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Scanning...
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            Run Scan Now
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => openEditScheduleModal(schedule)}
                        className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
                        title="Edit Schedule"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setScheduleToDelete(schedule)}
                        className="p-2 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-500 rounded-lg transition-colors"
                        title="Delete Schedule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-24 text-center surface rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Recurring Scan Schedules</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                  Schedule weekly or monthly automated visibility scans to track core entity scores automatically.
                </p>
              </div>
              <button
                onClick={() => openCreateScheduleModal()}
                className="btn-base bg-emerald-600 hover:bg-emerald-700 text-white btn-md rounded-xl shadow-sm inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Schedule First Recurring Scan
              </button>
            </div>
          )}
        </div>
      )}

      {/* MISSION LIST VIEW */}
      {activeTab === 'missions' && (
      <div className="space-y-4">
        {aggregatedMissions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {aggregatedMissions.map((m, i) => {
              const isBlocked = m.dependencies?.some(depId => {
                const dep = aggregatedMissions.find(am => am.id === depId);
                return dep && dep.status !== 'completed';
              });

              return (
              <div key={`${m.businessName}-${m.id}`} className={`surface p-4 rounded-xl shadow-sm border flex flex-col justify-between transition-all group relative overflow-hidden h-[600px] animate-fadeIn ${m.isVsMission ? 'border-orange-200 dark:border-orange-800' : 'border-slate-200 dark:border-slate-800'} ${isBlocked ? 'opacity-75' : ''}`} style={{ animationDelay: `${i * 0.05}s` }}>
                <div className={`absolute top-0 right-0 w-32 h-32 ${m.isVsMission ? 'bg-orange-500/5' : 'ocula-gradient-bg opacity-[0.03]'} blur-[60px] group-hover:opacity-10 transition-opacity`}></div>
                
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.businessName}</span>
                        
                        {(m.isRecurring || m.recurringFrequency) && (
                          <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 flex items-center gap-1 shadow-2xs">
                            <RotateCw className="w-2.5 h-2.5" /> Recurring ({m.recurringFrequency || 'weekly'})
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            const nextStatusMap: Record<string, 'active' | 'paused' | 'error' | 'completed'> = {
                              'active': 'paused',
                              'paused': 'error',
                              'error': 'active',
                              'planned': 'active',
                              'completed': 'active'
                            };
                            const nextStatus = nextStatusMap[m.status || 'active'] || 'active';
                            handleUpdateMissionStatus(m.scanId, m.id, nextStatus);
                          }}
                          title="Click to toggle status (Active -> Paused -> Error -> Active)"
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border transition-all hover:scale-105 active:scale-95 shadow-2xs ${
                            m.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' :
                            m.status === 'paused' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' :
                            m.status === 'error' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800' :
                            m.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' :
                            'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            m.status === 'active' ? 'bg-emerald-500 animate-pulse' :
                            m.status === 'paused' ? 'bg-amber-500' :
                            m.status === 'error' ? 'bg-rose-500 animate-ping' :
                            m.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'
                          }`}></span>
                          {m.status === 'active' ? 'Active' : m.status === 'paused' ? 'Paused' : m.status === 'error' ? 'Error' : m.status}
                        </button>

                        {m.isVsMission && (
                          <div className="flex items-center space-x-1">
                            <span className="text-[7px] font-black text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded">VS</span>
                            <span className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">{m.targetCompetitor || 'Market'}</span>
                          </div>
                        )}
                        {isBlocked && (
                          <div className="flex items-center space-x-1">
                            <span className="text-[7px] font-black text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                              <AlertTriangle className="w-2 h-2" /> BLOCKED
                            </span>
                          </div>
                        )}
                      </div>
                      <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-tight min-h-[4rem] group-hover:text-indigo-600 transition-colors flex items-start gap-2">
                        {m.isVsMission && <span className="text-orange-500 mt-1">⚔️</span>}
                        {m.name}
                      </h4>
                    </div>
                    <div className="flex flex-col items-end">
                      <button 
                        onClick={() => handleDeleteMission(m.id, m.name)}
                        className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg transition-colors mb-2"
                        title="Delete Mission"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{m.progress}%</span>
                      <span className={`text-[7px] font-black uppercase tracking-widest ${
                        m.progress === 100 ? 'text-emerald-500' : 
                        m.progress > 0 ? 'text-indigo-500' : 
                        'text-slate-300 dark:text-slate-600'
                      }`}>
                        {m.progress === 100 ? 'Completed' : m.progress > 0 ? 'In Progress' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl border ${m.isVsMission ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' : 'bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-4 italic">"{m.objective}"</p>
                  </div>
                  
                  {(m.targetMetrics || m.assignee || m.notes) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      {m.targetMetrics && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Metrics</p>
                          <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{m.targetMetrics}</p>
                        </div>
                      )}
                      {m.assignee && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Assignee</p>
                          <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{m.assignee}</p>
                        </div>
                      )}
                      {m.notes && (
                        <div className="col-span-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Notes</p>
                          <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">{m.notes}</p>
                        </div>
                      )}
                      {m.dependencies && m.dependencies.length > 0 && (
                        <div className="col-span-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Dependencies</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {m.dependencies.map(depId => {
                              const depMission = aggregatedMissions.find(am => am.id === depId);
                              const isDepCompleted = depMission?.status === 'completed';
                              return (
                                <span key={depId} className={`text-[9px] font-bold px-2 py-1 rounded-md border flex items-center gap-1 ${isDepCompleted ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'}`}>
                                  {isDepCompleted ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                  {depMission ? depMission.name : 'Unknown Mission'}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                  <div className="pt-10 space-y-4 relative z-10 border-t border-slate-50 dark:border-slate-800 mt-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-1">
                         <div className="flex items-center gap-2">
                           <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm flex items-center gap-1.5 ${
                             m.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' : 
                             m.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' : 
                             m.status === 'paused' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30' : 
                             m.status === 'error' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30' : 
                             'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                           }`}>
                             <span className={`w-1.5 h-1.5 rounded-full ${
                               m.status === 'active' ? 'bg-emerald-500 animate-pulse' :
                               m.status === 'paused' ? 'bg-amber-500' :
                               m.status === 'error' ? 'bg-rose-500' :
                               m.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-400'
                             }`}></span>
                             {m.status}
                           </span>
                           {m.deadline && (
                             <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm ${getDeadlineColor(m.deadline, m.status)}`}>
                               <Calendar className="w-3 h-3" />
                               <span className="text-[8px] uppercase tracking-widest">{new Date(m.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                               {isOverdue(m.deadline) && m.status !== 'completed' && (
                                 <span className="flex items-center gap-1 ml-1">
                                   <span className="w-1 h-1 rounded-full bg-rose-500 animate-ping"></span>
                                   <span className="text-[7px] font-black uppercase">Overdue</span>
                                 </span>
                               )}
                             </div>
                           )}
                         </div>
                         <div className="flex items-center space-x-3">
                            {m.isVsMission && <span className="text-[8px] font-black uppercase text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">VS MODE</span>}
                            {m.linkedKpiId && <span className="text-[8px] font-black uppercase text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">KPI MISSION</span>}
                            <div className="flex items-center gap-1.5">
                               <div className={`w-1.5 h-1.5 rounded-full ${m.priority === 'high' ? 'bg-slate-900 dark:bg-white' : m.priority === 'medium' ? 'bg-slate-500' : 'bg-slate-300'}`}></div>
                               <span className={`text-[8px] font-black uppercase ${m.priority === 'high' ? 'text-slate-900 dark:text-white' : m.priority === 'medium' ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400 dark:text-slate-500'}`}>{m.priority}</span>
                            </div>
                         </div>
                      </div>
                    
                    <div className="relative pt-4 pb-2 group/slider h-12 flex items-center">
                      <div 
                        className="absolute -top-2 px-2 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black rounded-lg opacity-0 group-hover/slider:opacity-100 transition-all pointer-events-none whitespace-nowrap z-20 shadow-sm"
                        style={{ left: `${m.progress}%`, transform: 'translateX(-50%)' }}
                      >
                        {m.progress}%
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-white"></div>
                      </div>

                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full absolute top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-75 ${m.isVsMission ? 'bg-amber-500' : 'ocula-gradient-bg'}`} 
                          style={{ width: `${m.progress}%` }}
                        ></div>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={m.progress}
                        disabled={isBlocked}
                        onChange={(e) => handleUpdateProgress(m.id, parseInt(e.target.value) || 0)}
                        className={`w-full h-8 bg-transparent appearance-none cursor-pointer outline-none relative z-10
                          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7 
                          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-4 
                          [&::-webkit-slider-thumb]:shadow-sm hover:[&::-webkit-slider-thumb]:scale-110 
                          transition-all ${m.isVsMission ? '[&::-webkit-slider-thumb]:border-amber-500' : '[&::-webkit-slider-thumb]:border-indigo-600'}
                          ${isBlocked ? 'cursor-not-allowed opacity-50' : ''}`}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleLaunchTactics(m, m.businessName)}
                      disabled={isBlocked}
                      className={`flex-grow btn-base text-white btn-sm shadow-sm ${m.isVsMission ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'} ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {m.isVsMission ? 'Combat Scry' : 'Scry Tactics'}
                    </button>
                    <button 
                      onClick={() => {
                        const scan = scans.find(s => (s?.businessName || '').toLowerCase() === (m?.businessName || '').toLowerCase());
                        onSelectScan(m.report, scan?.id);
                      }}
                      className="btn-secondary btn-sm"
                    >
                      Dossier →
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          <div className="py-48 text-center surface rounded-[5rem] border-4 border-dashed border-slate-100 dark:border-slate-800 animate-fadeIn">
             <div className="w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700">
                <Target className="w-12 h-12 text-slate-200 dark:text-slate-600" />
             </div>
             <h3 className="text-2xl font-black text-slate-300 dark:text-slate-600 mb-4 tracking-tight uppercase">No Missions Synchronized</h3>
             <p className="text-slate-400 dark:text-slate-500 font-bold mb-4 max-w-xs mx-auto text-sm">Deploy your first growth vector by adding a mission to an active business profile.</p>
             <button onClick={() => setShowCreateModal(true)} className="btn-base bg-indigo-600 hover:bg-indigo-700 text-white btn-lg rounded-xl shadow-sm">Initiate First Deployment</button>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default GlobalMissionControl;
