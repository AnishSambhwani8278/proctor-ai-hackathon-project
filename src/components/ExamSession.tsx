import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { AlertTriangle, Eye, MessageSquare, Send, Camera, ShieldAlert, Clock, CheckCircle, XCircle, Smartphone, MonitorX, Home, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { Link, useLocation } from 'react-router-dom';
import { detectFace, cleanup } from '../lib/faceDetection';
import { detectAIContent, checkPlagiarism } from '../lib/gemini';

const socket = io('http://localhost:3000');

interface Question {
  id: string;
  text: string;
  answer: string;
}

interface Anomaly {
  type: string;
  count: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: Date;
}

export function ExamSession() {
  const location = useLocation();
  const assessment = location.state?.assessment;
  const [questions, setQuestions] = useState<Question[]>(
    assessment?.questions.map((q: Question) => ({ ...q, answer: '' })) || []
  );
  
  const webcamRef = useRef<Webcam>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isAIDetected, setIsAIDetected] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [hasWebcamAccess, setHasWebcamAccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(assessment?.totalTime * 60 || 3600);
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [examId] = useState('exam-123');
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [outOfFrameCount, setOutOfFrameCount] = useState(0);
  const [phoneUsageCount, setPhoneUsageCount] = useState(0);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [faceDetectionInterval, setFaceDetectionInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && examStarted && !examCompleted) {
        setTabSwitchCount(prev => prev + 1);
        setWarnings(prev => [...prev, 'Tab switching detected']);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (faceDetectionInterval) {
        clearInterval(faceDetectionInterval);
      }
      cleanup();
    };
  }, [examStarted, examCompleted, faceDetectionInterval]);

  useEffect(() => {
    if (examStarted && timeLeft > 0 && !examCompleted) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [examStarted, timeLeft, examCompleted]);

  useEffect(() => {
    socket.emit('join-exam', examId);

    socket.on('activity-alert', (data) => {
      if (!examCompleted) {
        setWarnings(prev => [...prev, data.message]);
      }
    });

    return () => {
      socket.off('activity-alert');
    };
  }, [examId, examCompleted]);

  useEffect(() => {
    if (hasWebcamAccess && examStarted && !examCompleted) {
      const interval = setInterval(async () => {
        if (webcamRef.current?.video && !examCompleted) {
          const result = await detectFace(webcamRef.current.video);
          
          if (!result.faceDetected && faceDetected) {
            setOutOfFrameCount(prev => prev + 1);
            socket.emit('suspicious-activity', {
              type: 'face-not-detected',
              message: 'No face detected in frame'
            });
            setFaceDetected(false);
          } else if (result.multipleFaces) {
            socket.emit('suspicious-activity', {
              type: 'multiple-faces',
              message: 'Multiple faces detected'
            });
          }

          if (result.phoneDetected) {
            setPhoneUsageCount(prev => prev + 1);
            socket.emit('suspicious-activity', {
              type: 'phone-detected',
              message: 'Phone usage detected'
            });
            setWarnings(prev => [...prev, 'Phone usage detected']);
          }
          
          setFaceDetected(result.faceDetected);
        }
      }, 1000);

      setFaceDetectionInterval(interval);
      return () => {
        clearInterval(interval);
        setFaceDetectionInterval(null);
      };
    }
  }, [faceDetected, hasWebcamAccess, examStarted, examCompleted]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleTextChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex].answer = text;
    setQuestions(updatedQuestions);
    
    if (text.length > 30 && !examCompleted) {
      const [aiResult, plagiarismResult] = await Promise.all([
        detectAIContent(text),
        checkPlagiarism(text)
      ]);

      if (aiResult) {
        setIsAIDetected(true);
        socket.emit('suspicious-activity', {
          type: 'ai-content',
          message: 'Potential AI-generated content detected'
        });
        setWarnings(prev => [...prev, 'AI-generated content detected']);
      }

      if (plagiarismResult.isPlagiarized) {
        socket.emit('suspicious-activity', {
          type: 'plagiarism',
          message: `Potential plagiarism detected (${Math.round(plagiarismResult.similarity * 100)}% similarity)`
        });
        setWarnings(prev => [...prev, `Plagiarism detected (${Math.round(plagiarismResult.similarity * 100)}% similarity)`]);
      }
    }
  };

  const handleWebcamAccess = (stream: MediaStream | null) => {
    setWebcamStream(stream);
    setHasWebcamAccess(!!stream);
    if (stream) {
      setExamStarted(true);
    }
  };

  const handleSubmit = () => {
    const hasEmptyAnswers = questions.some(q => !q.answer.trim());
    if (hasEmptyAnswers) {
      setSubmitAttempted(true);
      setWarnings(prev => [...prev, 'Please answer all questions before submitting']);
      return;
    }

    setExamCompleted(true);
    
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      setWebcamStream(null);
    }
    if (faceDetectionInterval) {
      clearInterval(faceDetectionInterval);
      setFaceDetectionInterval(null);
    }
    cleanup();

    let aiAnomaly: Anomaly | undefined;
    if (isAIDetected) {
      aiAnomaly = {
        type: 'AI Content',
        count: 1,
        severity: 'high',
        description: 'Potential use of AI-generated content',
        timestamp: new Date()
      };
    }

    if (tabSwitchCount > 0 || isAIDetected) {
      const activity = {
        id: Date.now().toString(),
        type: 'High Risk Activity Detected',
        description: [
          tabSwitchCount > 0 ? `Tab switching detected (${tabSwitchCount} times).` : '',
          isAIDetected ? 'AI-generated content detected.' : ''
        ].filter(Boolean).join(' '),
        timestamp: new Date(),
        severity: 'high'
      };
      const existingActivities = JSON.parse(localStorage.getItem('recentActivities') || '[]');
      localStorage.setItem('recentActivities', JSON.stringify([activity, ...existingActivities.slice(0, 9)]));
    }
    
    const finalAnomalies: Anomaly[] = [
      {
        type: 'Tab Switching',
        count: tabSwitchCount,
        severity: tabSwitchCount > 5 ? 'high' : tabSwitchCount > 2 ? 'medium' : 'low',
        description: 'Switched between browser tabs during exam',
        timestamp: new Date()
      },
      {
        type: 'Face Detection',
        count: outOfFrameCount,
        severity: outOfFrameCount > 10 ? 'high' : outOfFrameCount > 5 ? 'medium' : 'low',
        description: 'Face not detected in camera frame',
        timestamp: new Date()
      },
      ...(aiAnomaly ? [aiAnomaly] : []),
      
    ];
    setAnomalies(finalAnomalies);

    const examResult = {
      id: Date.now().toString(),
      timestamp: new Date(),
      anomalies: finalAnomalies,
      warnings: warnings,
      tabSwitches: tabSwitchCount,
      aiDetected: isAIDetected,
      phoneUsage: phoneUsageCount,
      outOfFrame: outOfFrameCount
    };
    const existingResults = JSON.parse(localStorage.getItem('examResults') || '[]');
    localStorage.setItem('examResults', JSON.stringify([examResult, ...existingResults]));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  if (examCompleted) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div 
            className="bg-white rounded-3xl shadow-xl p-8 border border-purple-100"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Exam Completed</h2>
              <p className="text-gray-600 mt-2">Your answers have been submitted successfully</p>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <ShieldAlert className="w-6 h-6 text-purple-500" />
                <span>Proctor Report</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {anomalies.map((anomaly, index) => (
                  <motion.div
                    key={index}
                    className={`p-6 rounded-2xl border ${
                      anomaly.severity === 'high' 
                        ? 'bg-red-50 border-red-100' 
                        : anomaly.severity === 'medium'
                        ? 'bg-yellow-50 border-yellow-100'
                        : 'bg-green-50 border-green-100'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{anomaly.type}</h4>
                        <p className="text-sm text-gray-600 mt-1">{anomaly.description}</p>
                      </div>
                      <span className={`text-2xl font-bold ${
                        anomaly.severity === 'high' 
                          ? 'text-red-600' 
                          : anomaly.severity === 'medium'
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }`}>
                        {anomaly.count}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl">
                <h4 className="font-semibold text-gray-900 mb-4">Suspicious Activities Timeline</h4>
                <div className="space-y-4">
                  {warnings.map((warning, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center space-x-3 text-gray-700"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      <span>{warning}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <motion.div 
              className="mt-8 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link 
                to="/dashboard"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold flex items-center space-x-3 shadow-lg shadow-blue-200/50 hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                <Home className="w-5 h-5" />
                <span>Return to Dashboard</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (!hasWebcamAccess) {
    return (
      <motion.div 
        className="min-h-[80vh] flex flex-col items-center justify-center space-y-6 bg-gradient-to-br from-blue-50 to-purple-50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Camera className="w-16 h-16 text-blue-500" />
        <h2 className="text-2xl font-bold text-gray-900">Camera Access Required</h2>
        <p className="text-gray-600 text-center max-w-md">
          To ensure exam integrity, we need access to your camera for proctoring.
          Please allow camera access to continue.
        </p>
        <Webcam
          ref={webcamRef}
          onUserMedia={handleWebcamAccess}
          className="hidden"
        />
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <motion.div 
          className="bg-white rounded-3xl shadow-xl p-8 border border-indigo-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h2>
            <motion.div 
              className="px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full flex items-center space-x-3"
              animate={{ scale: timeLeft <= 300 ? [1, 1.1, 1] : 1 }}
              transition={{ repeat: timeLeft <= 300 ? Infinity : 0, duration: 1 }}
            >
              <Clock className={`w-5 h-5 ${timeLeft <= 300 ? 'text-red-500' : 'text-blue-600'}`} />
              <span className={`font-semibold ${timeLeft <= 300 ? 'text-red-500' : 'text-blue-600'}`}>
                {formatTime(timeLeft)}
              </span>
            </motion.div>
          </div>
          <div className="prose max-w-none">
            <p className="text-gray-700 text-lg">
              {questions[currentQuestionIndex].text}
            </p>
          </div>
          <div className="mt-8 space-y-6">
            <div className="relative">
              <textarea
                className={`w-full h-64 p-6 border ${
                  submitAttempted && !questions[currentQuestionIndex].answer.trim()
                    ? 'border-red-300 focus:ring-red-400'
                    : 'border-indigo-200 focus:ring-purple-400'
                } rounded-2xl focus:ring-2 focus:border-transparent resize-none text-gray-700`}
                placeholder="Type your answer here..."
                value={questions[currentQuestionIndex].answer}
                onChange={handleTextChange}
              />
              {submitAttempted && !questions[currentQuestionIndex].answer.trim() && (
                <p className="text-red-500 text-sm mt-2">This question requires an answer</p>
              )}
            </div>
            
            <div className="flex items-center justify-between space-x-4">
              <motion.button
                className="px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-semibold flex items-center space-x-2 disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Previous</span>
              </motion.button>

              {currentQuestionIndex === questions.length - 1 ? (
                <motion.button
                  className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold flex items-center justify-center space-x-3 shadow-lg shadow-indigo-200/50"
                  whileHover={{ scale: 1.02, boxShadow: '0 20px 25px -5px rgb(99 102 241 / 0.2)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                >
                  <Send className="w-5 h-5" />
                  <span>Submit All Answers</span>
                </motion.button>
              ) : (
                <motion.button
                  className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold flex items-center justify-center space-x-3 shadow-lg shadow-blue-200/50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNextQuestion}
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              )}
            </div>

            <div className="flex justify-center space-x-2">
              {questions.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === currentQuestionIndex
                      ? 'bg-indigo-600'
                      : questions[index].answer.trim()
                      ? 'bg-green-400'
                      : 'bg-gray-300'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => setCurrentQuestionIndex(index)}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="space-y-4">
        <motion.div
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-purple-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600">
            <h3 className="text-white font-semibold flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>Proctor View</span>
            </h3>
          </div>
          <div className="p-4">
            <Webcam
              ref={webcamRef}
              className="w-full rounded-2xl"
              mirrored
            />
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-3xl shadow-xl border border-red-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <span>Activity Monitor</span>
            </h3>
          </div>
          <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto">
            <AnimatePresence>
              {!faceDetected && (
                <motion.div
                  className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-2xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Face not detected</span>
                </motion.div>
              )}
              {warnings.map((warning, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-4 rounded-2xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>{warning}</span>
                </motion.div>
              ))}
              {isAIDetected && (
                <motion.div
                  className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-2xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Potential AI-generated content detected</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          className={`bg-gradient-to-r ${
            faceDetected 
              ? 'from-emerald-400 to-green-500' 
              : 'from-red-500 to-pink-500'
          } rounded-3xl shadow-xl p-4 text-white`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>Proctor AI {faceDetected ? 'Active' : 'Warning'}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
