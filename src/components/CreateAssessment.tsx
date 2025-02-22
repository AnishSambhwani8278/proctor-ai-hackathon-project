import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Question {
  id: string;
  text: string;
  timeLimit?: number;
}

export function CreateAssessment() {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [questions, setQuestions] = useState<Question[]>([{ id: '1', text: '' }]);
  const [totalTime, setTotalTime] = useState(60);
  const navigate = useNavigate();

  const handleAddQuestion = () => {
    setQuestions([...questions, { id: String(questions.length + 1), text: '' }]);
  };

  const handleRemoveQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const handleQuestionChange = (id: string, text: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, text } : q));
  };

  const handleSubmit = () => {
    const assessment = {
      id: Date.now().toString(),
      title,
      subject,
      questions,
      totalTime,
      createdAt: new Date(),
      status: 'Active',
      participants: '0/0'
    };

    // Get existing assessments from localStorage or initialize empty array
    const existingAssessments = JSON.parse(localStorage.getItem('assessments') || '[]');
    localStorage.setItem('assessments', JSON.stringify([...existingAssessments, assessment]));

    // Update recent activity
    const activity = {
      id: Date.now().toString(),
      type: 'Assessment Created',
      description: `New assessment "${title}" created`,
      timestamp: new Date(),
      severity: 'info'
    };
    const existingActivities = JSON.parse(localStorage.getItem('recentActivities') || '[]');
    localStorage.setItem('recentActivities', JSON.stringify([activity, ...existingActivities.slice(0, 9)]));

    navigate('/assessments');
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Create New Assessment</h1>
        <button
          onClick={() => navigate('/assessments')}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assessment Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter assessment title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter subject"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Time (minutes)
          </label>
          <input
            type="number"
            value={totalTime}
            onChange={(e) => setTotalTime(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Questions</h2>
            <motion.button
              onClick={handleAddQuestion}
              className="px-4 py-2 bg-blue-100 text-blue-600 rounded-xl flex items-center space-x-2 hover:bg-blue-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4" />
              <span>Add Question</span>
            </motion.button>
          </div>

          {questions.map((question, index) => (
            <motion.div
              key={question.id}
              className="p-6 border border-gray-200 rounded-2xl space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Question {index + 1}
                </h3>
                {questions.length > 1 && (
                  <button
                    onClick={() => handleRemoveQuestion(question.id)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
              </div>
              <textarea
                value={question.text}
                onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                className="w-full h-32 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter your question here..."
              />
            </motion.div>
          ))}
        </div>

        <div className="flex justify-end">
          <motion.button
            onClick={handleSubmit}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl flex items-center space-x-2 shadow-lg shadow-blue-200/50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!title || !subject || questions.some(q => !q.text.trim())}
          >
            <Save className="w-5 h-5" />
            <span>Save Assessment</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}