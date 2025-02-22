import React, { useState, useEffect } from 'react';
import { Download, Filter, AlertTriangle, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  severity?: string;
}

interface FilterOptions {
  severity: string;
  dateRange: string;
  activityType: string;
}

export function Reports() {
  const [stats, setStats] = useState({
    suspicious: { tabSwitching: 24, aiDetection: 12, multipleDevices: 8 },
    assessments: { total: 156, flagged: 32, clean: 124 },
    performance: { responseTime: 234, uptime: 99.9, apiCalls: 45 }
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    severity: 'all',
    dateRange: '24h',
    activityType: 'all'
  });

  useEffect(() => {
    // Initial load of activities
    const storedActivities = JSON.parse(localStorage.getItem('recentActivities') || '[]');
    setRecentActivities(storedActivities);

    // Set up interval for random stat updates
    const interval = setInterval(() => {
      setStats(prev => ({
        suspicious: {
          tabSwitching: Math.min(100, prev.suspicious.tabSwitching + Math.floor(Math.random() * 3) - 1),
          aiDetection: Math.min(100, prev.suspicious.aiDetection + Math.floor(Math.random() * 3) - 1),
          multipleDevices: Math.min(100, prev.suspicious.multipleDevices + Math.floor(Math.random() * 3) - 1)
        },
        assessments: {
          total: prev.assessments.total + Math.floor(Math.random() * 2),
          flagged: prev.assessments.flagged + Math.floor(Math.random() * 2),
          clean: prev.assessments.clean + Math.floor(Math.random() * 2)
        },
        performance: {
          responseTime: Math.max(100, Math.min(500, prev.performance.responseTime + Math.floor(Math.random() * 20) - 10)),
          uptime: Math.min(100, Math.max(98, prev.performance.uptime + (Math.random() * 0.1 - 0.05))),
          apiCalls: prev.performance.apiCalls + Math.floor(Math.random() * 5)
        }
      }));
    }, 3000);

    // Set up interval for activities check
    const activityInterval = setInterval(() => {
      const updatedActivities = JSON.parse(localStorage.getItem('recentActivities') || '[]');
      setRecentActivities(updatedActivities);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(activityInterval);
    };
  }, []);

  const handleExport = () => {
    const exportData = {
      stats,
      recentActivities,
      exportDate: new Date().toISOString(),
      filters
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proctor-report-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const applyFilters = (activities: Activity[]) => {
    return activities.filter(activity => {
      const date = new Date(activity.timestamp);
      const now = new Date();
      const hoursDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      const matchesSeverity = filters.severity === 'all' || activity.severity === filters.severity;
      const matchesType = filters.activityType === 'all' || activity.type.toLowerCase().includes(filters.activityType.toLowerCase());
      const matchesDate = filters.dateRange === 'all' ||
        (filters.dateRange === '24h' && hoursDiff <= 24) ||
        (filters.dateRange === '7d' && hoursDiff <= 168) ||
        (filters.dateRange === '30d' && hoursDiff <= 720);

      return matchesSeverity && matchesType && matchesDate;
    });
  };

  const filteredActivities = applyFilters(recentActivities);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analysis Reports</h1>
        <div className="flex space-x-4">
          <motion.button 
            className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilterModal(true)}
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </motion.button>
          <motion.button 
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExport}
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div 
          className="bg-white rounded-3xl shadow-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Suspicious Activities</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tab Switching</span>
              <span className="font-semibold text-gray-900">{stats.suspicious.tabSwitching}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">AI Detection</span>
              <span className="font-semibold text-gray-900">{stats.suspicious.aiDetection}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Multiple Devices</span>
              <span className="font-semibold text-gray-900">{stats.suspicious.multipleDevices}%</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-3xl shadow-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Assessments</span>
              <span className="font-semibold text-gray-900">{stats.assessments.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Flagged Sessions</span>
              <span className="font-semibold text-red-600">{stats.assessments.flagged}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Clean Sessions</span>
              <span className="font-semibold text-green-600">{stats.assessments.clean}</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-3xl shadow-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Average Response Time</span>
              <span className="font-semibold text-gray-900">{stats.performance.responseTime}ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Uptime</span>
              <span className="font-semibold text-gray-900">{stats.performance.uptime.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Calls</span>
              <span className="font-semibold text-gray-900">{stats.performance.apiCalls}k/day</span>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showFilterModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Filter Reports</h3>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severity
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.severity}
                    onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                  >
                    <option value="all">All Severities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.dateRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  >
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="all">All Time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activity Type
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.activityType}
                    onChange={(e) => setFilters(prev => ({ ...prev, activityType: e.target.value }))}
                  >
                    <option value="all">All Activities</option>
                    <option value="ai">AI Detection</option>
                    <option value="tab">Tab Switching</option>
                    <option value="face">Face Detection</option>
                    <option value="phone">Phone Usage</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    onClick={() => {
                      setFilters({
                        severity: 'all',
                        dateRange: '24h',
                        activityType: 'all'
                      });
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="bg-white rounded-3xl shadow-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Incidents</h3>
        <div className="space-y-4">
          <AnimatePresence>
            {filteredActivities.map((activity) => (
              <motion.div
                key={activity.id}
                className="flex items-start space-x-4 p-4 border border-gray-100 rounded-2xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{activity.type}</span>
                    {activity.severity === 'high' && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        High Risk
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{activity.description}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(activity.timestamp).toLocaleString()}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}