import React, { useState, useEffect } from 'react';
import { FileText, MoreVertical, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface Assessment {
  id: string;
  title: string;
  subject: string;
  status: string;
  participants: string;
  createdAt: string;
  questions: Array<{ id: string; text: string }>;
}

export function Assessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [showDeleteMenu, setShowDeleteMenu] = useState<string | null>(null);
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'admin';
  const [completedAssessments] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('completedAssessments') || '[]');
  });

  useEffect(() => {
    const storedAssessments = JSON.parse(localStorage.getItem('assessments') || '[]');
    setAssessments(storedAssessments);

    const interval = setInterval(() => {
      const updatedAssessments = JSON.parse(localStorage.getItem('assessments') || '[]');
      setAssessments(updatedAssessments);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleDelete = (id: string) => {
    const updatedAssessments = assessments.filter(assessment => assessment.id !== id);
    localStorage.setItem('assessments', JSON.stringify(updatedAssessments));
    setAssessments(updatedAssessments);
    setShowDeleteMenu(null);
  };

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || assessment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
        {isAdmin && (
          <Link to="/create-assessment">
            <motion.button 
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 flex items-center space-x-2 shadow-lg shadow-blue-200/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
              <span>Create Assessment</span>
            </motion.button>
          </Link>
        )}
      </motion.div>

      <motion.div 
        className="bg-white rounded-3xl shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <input
              type="text"
              placeholder="Search assessments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select 
              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Completed</option>
              <option>Scheduled</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-xl">
                    Assessment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  {isAdmin ? (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-xl">
                      Actions
                    </th>
                  ) : (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-xl">
                      Completed
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAssessments.map((assessment) => (
                  <motion.tr
                    key={assessment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      {!isAdmin ? (
                        <Link 
                          to="/exam-session" 
                          state={{ assessment }}
                          className="flex items-center group"
                        >
                          <FileText className="w-5 h-5 text-gray-400 group-hover:text-blue-500 mr-3 transition-colors" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                              {assessment.title}
                            </div>
                            <div className="text-sm text-gray-500">{assessment.subject}</div>
                          </div>
                        </Link>
                      ) : (
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {assessment.title}
                            </div>
                            <div className="text-sm text-gray-500">{assessment.subject}</div>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {assessment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{assessment.participants}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(assessment.createdAt).toLocaleDateString()}
                    </td>
                    {isAdmin ? (
                      <td className="px-6 py-4">
                        <div className="relative">
                          <motion.button 
                            className="text-gray-400 hover:text-gray-600"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowDeleteMenu(showDeleteMenu === assessment.id ? null : assessment.id)}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </motion.button>
                          <AnimatePresence>
                            {showDeleteMenu === assessment.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-10"
                              >
                                <button
                                  onClick={() => handleDelete(assessment.id)}
                                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-xl flex items-center space-x-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Delete</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                    ) : (
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          completedAssessments.includes(assessment.id)
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {completedAssessments.includes(assessment.id) ? 'Yes' : 'No'}
                        </span>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}