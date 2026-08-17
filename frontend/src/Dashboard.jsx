import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  History as HistoryIcon, 
  User as UserIcon, 
  Settings, 
  LogOut,
  Search,
  MessageSquareWarning,
  Trash2,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';


const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const Dashboard = ({ handleLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showTechnical, setShowTechnical] = useState(false);
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [historyItems, setHistoryItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  const [stats, setStats] = useState({ total_analyses: 0, safe_count: 0, constructive_count: 0, toxic_count: 0 });
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    } else if (activeTab === 'overview') {
      fetchStats();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/api/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Updated hardcoded URL
      const response = await fetch(`${API_BASE}/api/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setHistoryItems(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDeleteHistory = async (id) => {
    try {
      const token = localStorage.getItem('token');
      // Updated hardcoded URL
      const response = await fetch(`${API_BASE}/api/history/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setHistoryItems(historyItems.filter(item => item._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClear = () => {
    setText('');
    setResult(null);
    setError(null);
    setShowTechnical(false);
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    setShowTechnical(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Unauthorized. Please log in again.");

      
      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        if (response.status === 401) {
            handleLogout(); 
            return;
        }
        throw new Error("Failed to analyze text");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatSentiment = (sentiment) => {
    if (!sentiment) return "Neutral";
    return sentiment.replace('_', ' ');
  };

  const chartData = [
    { name: 'Safe', count: stats.safe_count, fill: '#10b981' },
    { name: 'Constructive', count: stats.constructive_count, fill: '#f59e0b' },
    { name: 'Toxic', count: stats.toxic_count, fill: '#ef4444' }
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <ShieldCheck className="w-6 h-6 text-indigo-600 mr-2" />
          <span className="text-xl font-bold text-gray-900 tracking-tight">SafeSpeak</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <LayoutDashboard className={`w-5 h-5 mr-3 ${activeTab === 'overview' ? 'text-indigo-600' : 'text-gray-400'}`} />
            Dashboard Overview
          </button>
          <button 
            onClick={() => setActiveTab('analyzer')}
            className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'analyzer' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <MessageSquareWarning className={`w-5 h-5 mr-3 ${activeTab === 'analyzer' ? 'text-indigo-600' : 'text-gray-400'}`} />
            Analyzer
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'history' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <HistoryIcon className={`w-5 h-5 mr-3 ${activeTab === 'history' ? 'text-indigo-600' : 'text-gray-400'}`} />
            History
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-1">
          <button onClick={handleLogout} className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5 mr-3 text-red-500" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-lg font-semibold text-gray-800 capitalize">{activeTab === 'overview' ? 'Dashboard Overview' : activeTab}</h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 text-sm">
              AC
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Platform Overview</h2>
                  <p className="text-gray-500 mt-1 text-base">Summary of your comment moderation and communication insights.</p>
                </div>

                {statsLoading ? (
                  <div className="text-center py-12 text-gray-400">Loading metrics...</div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-2">
                        <div className="flex items-center justify-between text-gray-500">
                          <span className="text-xs font-bold uppercase tracking-wider">Total Analyzed</span>
                          <BarChart3 className="w-4 h-4 text-indigo-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.total_analyses}</p>
                      </div>

                      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-2">
                        <div className="flex items-center justify-between text-gray-500">
                          <span className="text-xs font-bold uppercase tracking-wider">Safe Content</span>
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.safe_count}</p>
                      </div>

                      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-2">
                        <div className="flex items-center justify-between text-gray-500">
                          <span className="text-xs font-bold uppercase tracking-wider">Constructive</span>
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.constructive_count}</p>
                      </div>

                      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-2">
                        <div className="flex items-center justify-between text-gray-500">
                          <span className="text-xs font-bold uppercase tracking-wider">Toxic Flagged</span>
                          <XCircle className="w-4 h-4 text-red-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.toxic_count}</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
                      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Analysis Tier Distribution</h3>
                      <div className="h-64 w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tickLine={false} />
                            <YAxis allowDecimals={false} tickLine={false} />
                            <Tooltip />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'analyzer' && (
              <>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Analyze Your Comment</h2>
                  <p className="text-gray-500 mt-1 text-base">Understand tone, toxicity and improve your communication.</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-1">
                    <textarea
                      className="w-full h-32 p-4 text-gray-800 placeholder-gray-400 bg-transparent border-none focus:ring-0 resize-none"
                      placeholder="Enter a comment you'd like SafeSpeak to analyze..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    ></textarea>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-medium">
                      {text.length} characters
                    </span>
                    
                    <div className="flex items-center gap-3">
                      {error && <span className="text-red-500 text-sm font-medium mr-2">{error}</span>}
                      
                      <button
                        onClick={handleClear}
                        disabled={loading || !text}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear
                      </button>
                      
                      <button
                        onClick={handleAnalyze}
                        disabled={loading || !text.trim()}
                        className="flex items-center px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 shadow-sm transition-colors"
                      >
                        {loading ? 'Analyzing...' : 'Analyze Comment'}
                      </button>
                    </div>
                  </div>
                </div>

                {result && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                    {result.analysis_tier === 'Safe' && (
                      <div className="bg-green-50/50 border border-green-200 rounded-lg p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldCheck className="w-6 h-6 text-green-600" />
                          <h3 className="text-green-800 font-bold text-lg">Content Appears Safe</h3>
                        </div>
                        <p className="text-gray-700 italic ml-8 mb-4 text-sm">"{result.text}"</p>
                        <div className="ml-8 flex gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-700 shadow-sm">Toxicity: SAFE</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-700 shadow-sm">Sentiment: {formatSentiment(result.sentiment).toUpperCase()}</span>
                        </div>
                      </div>
                    )}

                    {result.analysis_tier === 'Constructive_Feedback' && (
                      <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquareWarning className="w-6 h-6 text-amber-600" />
                          <h3 className="text-amber-800 font-bold text-lg">Safe, but highly critical</h3>
                        </div>
                        <p className="text-gray-700 italic ml-8 mb-4 text-sm">"{result.text}"</p>
                        <div className="ml-8 flex gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-700 shadow-sm">Toxicity: SAFE</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white border border-amber-200 text-amber-800 shadow-sm">Sentiment: NEGATIVE / PERSONAL</span>
                        </div>
                      </div>
                    )}

                    {result.analysis_tier === 'Toxic' && (
                      <div className="bg-red-50/50 border border-red-200 rounded-lg p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center border border-red-200 text-red-600 text-xs font-bold">!</div>
                          <h3 className="text-red-800 font-bold text-lg">Toxic Content Detected</h3>
                        </div>
                        <p className="text-gray-700 italic ml-8 mb-4 text-sm">"{result.text}"</p>
                        <div className="ml-8 flex gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-600 text-white shadow-sm border border-red-700">Toxicity: TOXIC</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-100">
                      <button 
                        onClick={() => setShowTechnical(!showTechnical)}
                        className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        {showTechnical ? 'Hide Technical Explanation' : 'View Technical Explanation'}
                      </button>
                      
                      {showTechnical && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 p-5 bg-gray-50 border border-gray-200 rounded-xl shadow-inner">
                          <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Model Probabilities</h4>
                            <div className="space-y-4">
                              {Object.entries(result.toxicity_scores).map(([category, score]) => (
                                <div key={category}>
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="capitalize font-medium text-gray-700">{category.replace('_', ' ')}</span>
                                    <span className="text-gray-500 font-mono">{(score * 100).toFixed(1)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.max(score * 100, 1)}%` }}></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Word Influence (LIME)</h4>
                            <div className="flex flex-wrap gap-2">
                              {result.lime_explanation?.map((item, index) => (
                                <div key={index} className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-md shadow-sm text-xs flex items-center gap-2">
                                  <span className="font-semibold text-gray-700">{item.word}</span>
                                  <span className={`font-mono ${item.weight > 0 ? 'text-red-600' : 'text-green-600'}`}>({item.weight > 0 ? '+' : ''}{item.weight.toFixed(3)})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {result.rewritten_text && (
                      <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-5 mt-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-indigo-600 text-lg">✨</span>
                          <h4 className="text-indigo-900 font-semibold text-sm">AI Suggested Rewrite</h4>
                        </div>
                        <p className="text-indigo-950 text-md mb-4 bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">"{result.rewritten_text}"</p>
                        <p className="text-xs text-indigo-700/80"><strong className="text-indigo-800">Why was this rewritten?</strong> {result.suggestion}</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Analysis History</h2>
                  <p className="text-gray-500 mt-1 text-base">Showing your 10 most recent comment analyses.</p>
                </div>

                {historyLoading ? (
                  <div className="text-center py-12 text-gray-400">Loading history...</div>
                ) : historyItems.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center space-y-4">
                    <p className="text-gray-600 font-medium">No analyses yet.</p>
                    <p className="text-gray-400 text-sm">Analyze your first comment to see your results here.</p>
                    <button onClick={() => setActiveTab('analyzer')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Analyze Comment</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {historyItems.map((item) => (
                      <div key={item._id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                        <div className="space-y-1.5 flex-1">
                          <p className="text-gray-900 font-medium text-sm">"{item.original_text}"</p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className={`px-2 py-0.5 rounded-full font-semibold ${item.analysis_tier === 'Toxic' ? 'bg-red-100 text-red-700' : item.analysis_tier === 'Constructive_Feedback' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                              {item.analysis_tier.replace('_', ' ')}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500 capitalize">Sentiment: {formatSentiment(item.sentiment)}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-400">{new Date(item.analyzed_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteHistory(item._id)}
                          className="text-gray-400 hover:text-red-600 p-2 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;



