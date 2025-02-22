import React, { useState, useEffect } from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { Users, FileCheck, AlertTriangle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export function Dashboard() {
  const [stats, setStats] = useState({
    suspicious: { tabSwitching: 24, aiDetection: 12, multipleDevices: 8 },
    assessments: { total: 156, flagged: 32, clean: 124 },
    performance: { responseTime: 234, uptime: 99.9, apiCalls: 45 }
  });

  useEffect(() => {
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

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Proctor Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Active Sessions"
          value="24"
          icon={<Users className="w-6 h-6 text-blue-600" />}
          className="rounded-3xl hover:shadow-blue-100/50"
        />
        <DashboardCard
          title="Completed Assessments"
          value="156"
          icon={<FileCheck className="w-6 h-6 text-green-600" />}
          className="rounded-3xl hover:shadow-green-100/50"
        />
        <DashboardCard
          title="Flagged Activities"
          value="8"
          icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
          className="rounded-3xl hover:shadow-red-100/50"
        />
        <DashboardCard
          title="Average Duration"
          value="45m"
          icon={<Clock className="w-6 h-6 text-purple-600" />}
          className="rounded-3xl hover:shadow-purple-100/50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          className="bg-white rounded-3xl shadow-md p-8 border border-blue-100 hover:shadow-lg hover:shadow-blue-100/30 transition-all duration-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">System Performance</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Average Response Time</span>
              <span className="font-semibold text-gray-900">{stats.performance.responseTime}ms</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                initial={{ width: '0%' }}
                animate={{ width: `${Math.min(100, (stats.performance.responseTime / 500) * 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">System Uptime</span>
              <span className="font-semibold text-gray-900">{stats.performance.uptime.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                initial={{ width: '0%' }}
                animate={{ width: `${stats.performance.uptime}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Calls</span>
              <span className="font-semibold text-gray-900">{stats.performance.apiCalls}k/day</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: '0%' }}
                animate={{ width: `${Math.min(100, (stats.performance.apiCalls / 100) * 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-3xl shadow-md p-8 border border-purple-100 hover:shadow-lg hover:shadow-purple-100/30 transition-all duration-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">System Status</h2>
          <div className="space-y-4">
            {[
              { name: 'AI Analysis Engine', status: 'Operational' },
              { name: 'Video Processing', status: 'Operational' },
              { name: 'Plagiarism Detection', status: 'Operational' }
            ].map((service, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-2xl border border-purple-100/50">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">{service.name}</span>
                  <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-xl text-sm font-medium">
                    {service.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}