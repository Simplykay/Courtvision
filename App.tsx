
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { analyzeGame, fetchLiveGames } from './services/geminiService';
import { GameInput, PredictionResult } from './types';
import PredictionCard from './components/PredictionCard';
import { 
  Activity, 
  LayoutDashboard, 
  Database, 
  History as HistoryIcon, 
  Loader2, 
  Award, 
  TrendingUp, 
  Upload, 
  ListFilter, 
  ArrowUpDown, 
  Trash2,
  Clock,
  Search,
  Zap,
  Radio,
  Wifi
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'predictions' | 'history'>('dashboard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number; message?: string } | null>(null);
  
  // Live Feed State
  const [isLiveFeedActive, setIsLiveFeedActive] = useState(false);
  
  const [sessionPredictions, setSessionPredictions] = useState<PredictionResult[]>([]);
  const [savedHistory, setSavedHistory] = useState<PredictionResult[]>(() => {
    const saved = localStorage.getItem('courtvision_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Team Logo State
  const [teamLogos, setTeamLogos] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('courtvision_logos');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Dynamic Date Logic
  const todayDate = useMemo(() => new Date(), []);
  const displayDate = todayDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();
  const queryDate = todayDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    try {
      localStorage.setItem('courtvision_logos', JSON.stringify(teamLogos));
    } catch (e) {
      console.warn("LocalStorage full or error saving logos", e);
    }
  }, [teamLogos]);

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'Newest' | 'Confidence'>('Newest');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [gameInput, setGameInput] = useState<GameInput>({
    league: 'NBA',
    context: 'Standard Regular Season Game. Team A is Home.',
    teamA: { name: 'Boston Celtics', lastFive: 'W, W, L, W, W', ppg: 120.4, oppPPG: 109.2, keyPlayer: 'Jayson Tatum', availability: 'Healthy' },
    teamB: { name: 'L.A. Lakers', lastFive: 'L, W, W, L, W', ppg: 115.8, oppPPG: 118.5, keyPlayer: 'LeBron James', availability: 'Questionable' }
  });

  useEffect(() => {
    localStorage.setItem('courtvision_history', JSON.stringify(savedHistory));
  }, [savedHistory]);

  // LIVE FEED SIMULATION ENGINE
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isLiveFeedActive && sessionPredictions.length > 0) {
      interval = setInterval(() => {
        setSessionPredictions(prev => {
          const next = [...prev];
          // Pick a random game to update
          const idx = Math.floor(Math.random() * next.length);
          const game = { ...next[idx] };
          
          if (!game.isLive) {
            game.isLive = true;
            game.currentPeriod = 1;
            game.currentClock = "11:58";
            game.liveEvents = [{ id: Date.now().toString(), time: "11:58", description: "Tip-off! Game has started.", type: 'period' }];
          } else {
            // Parse clock
            let [min, sec] = (game.currentClock || "12:00").split(':').map(Number);
            let totalSec = min * 60 + sec;
            
            if (totalSec > 0) {
              const drop = Math.floor(Math.random() * 20) + 10; // Drop 10-30 seconds
              totalSec = Math.max(0, totalSec - drop);
              min = Math.floor(totalSec / 60);
              sec = totalSec % 60;
              game.currentClock = `${min}:${sec < 10 ? '0'+sec : sec}`;

              // Random Event
              const eventChance = Math.random();
              const teamA = game.matchup.split(' vs ')[0];
              const teamB = game.matchup.split(' vs ')[1];

              if (eventChance > 0.6) {
                 const isTeamA = Math.random() > 0.5;
                 const points = Math.random() > 0.7 ? 3 : 2;
                 const scorer = isTeamA ? teamA : teamB;
                 
                 if (isTeamA) game.predictedScore.teamA += points;
                 else game.predictedScore.teamB += points;

                 game.liveEvents = [
                   ...(game.liveEvents || []), 
                   { 
                     id: Date.now().toString(), 
                     time: game.currentClock, 
                     description: `${scorer} scores ${points} points!`, 
                     type: 'score' 
                   }
                 ];
              } else if (eventChance < 0.2) {
                 game.liveEvents = [
                   ...(game.liveEvents || []), 
                   { 
                     id: Date.now().toString(), 
                     time: game.currentClock, 
                     description: "Defensive rebound secured.", 
                     type: 'score' 
                   }
                 ];
              }
            } else {
               // End of Period logic could go here, for now just reset to next period
               if ((game.currentPeriod || 1) < 4) {
                 game.currentPeriod = (game.currentPeriod || 1) + 1;
                 game.currentClock = "12:00";
                 game.liveEvents = [
                   ...(game.liveEvents || []), 
                   { id: Date.now().toString(), time: "12:00", description: `Start of Q${game.currentPeriod}`, type: 'period' }
                 ];
               }
            }
          }
          
          next[idx] = game;
          return next;
        });
      }, 2000); // Update frequency
    }

    return () => clearInterval(interval);
  }, [isLiveFeedActive, sessionPredictions.length]);


  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeGame(gameInput);
      setSessionPredictions(prev => [result, ...prev]);
      setActiveTab('predictions');
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Analysis failed. Please check your inputs.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLiveScrape = async () => {
    setIsScraping(true);
    setBulkProgress({ current: 0, total: 100, message: "Surveilling global professional schedules..." });
    try {
      // Use dynamic date derived from system time
      const games = await fetchLiveGames(queryDate);
      
      if (games.length === 0) {
        alert("No high-profile games detected for this slate. Try again later.");
        return;
      }

      setBulkProgress({ current: 0, total: games.length, message: `Found ${games.length} matchups. Running models...` });
      
      const results: PredictionResult[] = [];
      for (let i = 0; i < games.length; i++) {
        setBulkProgress(prev => ({ ...prev!, current: i + 1, message: `Processing: ${games[i].teamA.name} vs ${games[i].teamB.name}` }));
        const result = await analyzeGame(games[i]);
        results.push(result);
      }
      
      setSessionPredictions(prev => [...results, ...prev]);
      setActiveTab('predictions');
    } catch (error) {
      console.error("Live fetch failed:", error);
    } finally {
      setIsScraping(false);
      setBulkProgress(null);
    }
  };

  const handleSaveToHistory = (prediction: PredictionResult) => {
    if (savedHistory.some(p => p.id === prediction.id)) return;
    setSavedHistory(prev => [prediction, ...prev]);
  };

  const handleDeleteSaved = (id: string) => {
    if (confirm("Permanently delete this report?")) {
      setSavedHistory(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleClearHistory = () => {
    if (confirm("Wipe all saved reports?")) setSavedHistory([]);
  };

  const handleLogoUpload = (teamName: string, file: File) => {
    // Limit size roughly to avoid hitting localStorage limits too fast
    if (file.size > 500000) {
      alert("Image is too large. Please use a file smaller than 500KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setTeamLogos(prev => ({ ...prev, [teamName]: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleLogoReset = (teamName: string) => {
    setTeamLogos(prev => {
      const next = { ...prev };
      delete next[teamName];
      return next;
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      const games: GameInput[] = [];
      const startIdx = lines[0].toLowerCase().includes('league') ? 1 : 0;
      for (let i = startIdx; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        if (parts.length >= 14) {
          games.push({
            league: parts[0],
            teamA: { name: parts[1], lastFive: parts[2], ppg: parseFloat(parts[3]) || 0, oppPPG: parseFloat(parts[4]) || 0, keyPlayer: parts[5], availability: parts[6] },
            teamB: { name: parts[7], lastFive: parts[8], ppg: parseFloat(parts[9]) || 0, oppPPG: parseFloat(parts[10]) || 0, keyPlayer: parts[11], availability: parts[12] },
            context: parts[13]
          });
        }
      }
      
      if (games.length === 0) return;
      setIsAnalyzing(true);
      setBulkProgress({ current: 0, total: games.length, message: "Processing CSV data..." });
      for (let i = 0; i < games.length; i++) {
        setBulkProgress(prev => ({ ...prev!, current: i + 1 }));
        const res = await analyzeGame(games[i]);
        setSessionPredictions(prev => [res, ...prev]);
      }
      setBulkProgress(null);
      setIsAnalyzing(false);
      setActiveTab('predictions');
    };
    reader.readAsText(file);
  };

  const handleInputChange = (team: 'teamA' | 'teamB', field: string, value: string | number) => {
    setGameInput(prev => ({
      ...prev,
      [team]: { ...prev[team], [field]: value }
    }));
  };

  const filteredPredictions = useMemo(() => {
    let list = [...sessionPredictions];
    if (statusFilter !== 'All') {
      list = list.filter(p => p.teamAAvailability.includes(statusFilter) || p.teamBAvailability.includes(statusFilter));
    }
    if (sortBy === 'Confidence') list.sort((a, b) => b.confidence - a.confidence);
    else list.sort((a, b) => b.timestamp - a.timestamp);
    return list;
  }, [sessionPredictions, statusFilter, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b1120] text-slate-200">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-20 md:w-64 bg-[#0f172a] border-r border-slate-800 z-50 flex flex-col">
        <div className="p-4 md:p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 basketball-gradient rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
              <Award className="text-white w-6 h-6" />
            </div>
            <span className="hidden md:block brand-font text-2xl font-bold text-white tracking-wider">COURTVISION</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-rose-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}>
            <LayoutDashboard size={20} />
            <span className="hidden md:block font-bold text-sm tracking-tight uppercase">Terminal</span>
          </button>
          <button onClick={() => setActiveTab('predictions')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'predictions' ? 'bg-rose-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}>
            <TrendingUp size={20} />
            <span className="hidden md:block font-bold text-sm tracking-tight uppercase">Live Reports</span>
          </button>
          <button onClick={() => setActiveTab('history')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'history' ? 'bg-rose-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}>
            <HistoryIcon size={20} />
            <span className="hidden md:block font-bold text-sm tracking-tight uppercase">Archives</span>
          </button>
        </nav>
      </div>

      <main className="ml-20 md:ml-64 flex-1 p-6 md:p-10 transition-all flex flex-col">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="brand-font text-4xl font-black text-white tracking-tight uppercase italic">Match Analytics Engine</h1>
            <p className="text-slate-500 mt-2 flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.3em]">
               <span className="text-rose-500 font-black">Today: {displayDate}</span>
               <span className="w-1 h-1 bg-slate-700 rounded-full" />
               Quantum-Grade Modeling Ready
            </p>
          </div>
          <div className="flex gap-4">
             <div className="bg-slate-900/80 px-6 py-3 rounded-xl border border-slate-800 flex flex-col justify-center text-center">
                <span className="text-[10px] text-slate-600 uppercase font-black tracking-widest">Active Results</span>
                <span className="text-xl font-black text-white">{sessionPredictions.length}</span>
             </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-6xl mx-auto w-full">
            <div className="lg:col-span-2 space-y-10">
              <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-10 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                {(isAnalyzing || isScraping) && (
                  <div className="absolute inset-0 bg-[#0b1120]/95 backdrop-blur-xl z-20 flex flex-col items-center justify-center p-12 text-center">
                    <Loader2 className="w-16 h-16 text-rose-500 animate-spin mb-8" />
                    <h3 className="text-3xl font-black text-white brand-font uppercase tracking-[0.2em]">Synthesizing Match Data...</h3>
                    {bulkProgress && (
                      <div className="w-full max-w-md mt-6">
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }} />
                        </div>
                        <p className="mt-4 font-black text-rose-500 text-[10px] uppercase tracking-widest animate-pulse">{bulkProgress.message || `Analysis ${bulkProgress.current}/${bulkProgress.total}`}</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-8">
                  <div className="flex items-center gap-4">
                    <Database size={28} className="text-rose-500" />
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter brand-font italic">Match Intelligence</h2>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={handleLiveScrape} 
                      disabled={isScraping}
                      className="flex items-center gap-3 px-8 py-4 rounded-xl bg-rose-600 hover:bg-rose-500 transition-all text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-rose-900/20 active:scale-95"
                    >
                      <Search size={16} />
                      Scrape Live Slate
                      <Zap size={14} className="animate-pulse" />
                    </button>
                    
                    <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-6 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all text-[11px] font-black uppercase tracking-widest text-white">
                      <Upload size={16} />
                      Import CSV
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">League Designation</label>
                      <input type="text" placeholder="NBA / Euroleague / Pro A" value={gameInput.league} onChange={(e) => setGameInput(prev => ({ ...prev, league: e.target.value }))} className="w-full bg-[#0b1120] border border-slate-800 rounded-xl px-5 py-5 focus:outline-none focus:border-rose-500 transition-all text-white font-bold text-lg" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Venue Context</label>
                      <textarea placeholder="e.g. Back-to-back game, altitude factor, high attendance..." rows={4} value={gameInput.context} onChange={(e) => setGameInput(prev => ({ ...prev, context: e.target.value }))} className="w-full bg-[#0b1120] border border-slate-800 rounded-xl px-5 py-5 focus:outline-none focus:border-rose-500 transition-all text-white font-medium resize-none" />
                    </div>
                  </div>
                  <div className="hidden md:flex flex-col items-center justify-center bg-[#0b1120] rounded-3xl border border-slate-800 p-8">
                    <div className="text-7xl font-black text-slate-800 brand-font italic tracking-tighter opacity-30 select-none">DATA</div>
                    <p className="text-[10px] text-slate-600 uppercase font-black mt-2 tracking-[0.4em]">Proprietary Model v3.1</p>
                  </div>
                </div>

                <div className="mt-12">
                  <button onClick={handleAnalyze} disabled={isAnalyzing || isScraping} className="w-full bg-white text-black hover:bg-slate-200 active:scale-[0.99] transition-all disabled:opacity-50 p-6 rounded-2xl flex items-center justify-center gap-4 font-black uppercase tracking-[0.3em] shadow-2xl">
                    <Activity size={24} />
                    <span>Run Probabilistic Model</span>
                  </button>
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 shadow-xl backdrop-blur-sm">
                <h2 className="text-lg font-black text-white mb-8 flex items-center gap-4 brand-font uppercase">
                   Feed Controls
                </h2>
                <div className="space-y-8">
                  <div>
                    <label className="text-[10px] uppercase text-slate-500 font-black mb-4 block tracking-[0.2em]">Filter: Roster Depth</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['All', 'Healthy', 'Questionable', 'Injured'].map(status => (
                        <button 
                          key={status}
                          onClick={() => { setStatusFilter(status); setActiveTab('predictions'); }}
                          className={`px-4 py-3 rounded-xl text-[10px] font-black transition-all border uppercase tracking-widest ${statusFilter === status ? 'bg-rose-600 border-rose-500 text-white shadow-lg' : 'bg-[#0b1120] border-slate-800 text-slate-500 hover:border-slate-600'}`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-slate-500 font-black mb-4 block tracking-[0.2em]">Sort: Priority Order</label>
                    <div className="flex gap-3">
                      {['Newest', 'Confidence'].map(sort => (
                        <button 
                          key={sort}
                          onClick={() => { setSortBy(sort as any); setActiveTab('predictions'); }}
                          className={`flex-1 px-4 py-3 rounded-xl text-[10px] font-black transition-all border uppercase tracking-widest ${sortBy === sort ? 'bg-slate-700 border-slate-600 text-white' : 'bg-[#0b1120] border-slate-800 text-slate-500 hover:border-slate-600'}`}
                        >
                          {sort}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-rose-600/10 border border-rose-500/20 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl -mr-16 -mt-16" />
                <h2 className="text-lg font-black text-rose-500 mb-4 flex items-center gap-4 brand-font uppercase">
                   AI Intelligence
                </h2>
                <p className="text-slate-400 leading-relaxed text-sm font-medium">
                  "The scraping engine currently targets all Euroleague and NBA games for {queryDate}, integrating real-time injury data into its projected quarter scores."
                </p>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'predictions' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-6 duration-500 max-w-4xl mx-auto w-full">
             <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-[#0f172a] border border-slate-800 p-8 rounded-3xl shadow-2xl">
                <div className="flex items-center gap-8">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
                    Feed: {filteredPredictions.length} Entries
                  </div>
                  <button 
                    onClick={() => setIsLiveFeedActive(!isLiveFeedActive)}
                    className={`flex items-center gap-3 px-6 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${isLiveFeedActive ? 'bg-red-600 border-red-500 text-white animate-pulse' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                  >
                    <Radio size={14} />
                    {isLiveFeedActive ? 'Live Connection Active' : 'Connect Real-Time Feed'}
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <ListFilter size={20} className="text-rose-500" />
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Displaying Active Projections</span>
                </div>
             </div>

            {filteredPredictions.length > 0 ? (
              <div className="flex flex-col gap-10">
                {filteredPredictions.map(pred => (
                  <PredictionCard 
                    key={pred.id} 
                    prediction={pred} 
                    onSave={() => handleSaveToHistory(pred)}
                    isSaved={savedHistory.some(p => p.id === pred.id)}
                    teamLogos={teamLogos}
                    onUploadLogo={handleLogoUpload}
                    onResetLogo={handleLogoReset}
                  />
                ))}
              </div>
            ) : (
              <div className="h-[500px] flex flex-col items-center justify-center bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-800 text-center">
                <Activity size={80} className="text-slate-800 mb-8" />
                <h3 className="text-2xl font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Feed Offline</h3>
                <p className="text-slate-500 font-medium max-w-xs mx-auto">Trigger the Live Scraper or Manual Terminal to populate projections.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-5xl mx-auto w-full">
             <div className="flex justify-between items-center px-4">
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter brand-font italic flex items-center gap-4">
                   <Clock className="text-rose-500 w-10 h-10" />
                   Logged Archives
                </h2>
                {savedHistory.length > 0 && (
                   <button onClick={handleClearHistory} className="flex items-center gap-3 px-8 py-3 rounded-xl bg-rose-600/10 border border-rose-500/20 text-rose-500 hover:bg-rose-600 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest">
                      <Trash2 size={16} />
                      Wipe Archives
                   </button>
                )}
             </div>

             <div className="bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[900px]">
                     <thead className="bg-[#1e293b]/50 text-slate-500 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-800">
                        <tr>
                           <th className="px-10 py-8">Logged Date</th>
                           <th className="px-10 py-8">Ref ID</th>
                           <th className="px-10 py-8">Matchup</th>
                           <th className="px-10 py-8 text-center">AI Outcome</th>
                           <th className="px-10 py-8 text-center">Certainty</th>
                           <th className="px-10 py-8 text-right">Delete</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-800/50">
                        {savedHistory.length > 0 ? savedHistory.map(pred => (
                          <tr key={pred.id} className="hover:bg-slate-700/10 transition-all group">
                             <td className="px-10 py-8">
                                <div className="text-sm font-black text-slate-300">{new Date(pred.timestamp).toLocaleDateString()}</div>
                                <div className="text-[10px] text-slate-600 font-black mt-1 uppercase">{new Date(pred.timestamp).toLocaleTimeString()}</div>
                             </td>
                             <td className="px-10 py-8 font-mono text-slate-600 text-xs tracking-tighter">#{pred.id.toUpperCase()}</td>
                             <td className="px-10 py-8">
                                <div className="text-[10px] font-black text-rose-500 uppercase mb-2 tracking-widest">{pred.league}</div>
                                <div className="text-xl font-black text-white uppercase brand-font italic">{pred.matchup}</div>
                             </td>
                             <td className="px-10 py-8 text-center">
                                <div className="inline-block px-5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-black text-xs uppercase tracking-widest">
                                   {pred.winner}
                                </div>
                             </td>
                             <td className="px-10 py-8 text-center">
                                <div className="text-2xl font-black text-white">{pred.confidence}%</div>
                                <div className={`text-[10px] font-black uppercase tracking-widest mt-1 ${pred.confidenceLevel === 'High' ? 'text-emerald-500' : 'text-amber-500'}`}>{pred.confidenceLevel}</div>
                             </td>
                             <td className="px-10 py-8 text-right">
                                <button onClick={() => handleDeleteSaved(pred.id)} className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-600 hover:text-rose-500 hover:border-rose-500/50 transition-all opacity-0 group-hover:opacity-100 shadow-xl">
                                   <Trash2 size={20} />
                                </button>
                             </td>
                          </tr>
                        )) : <tr><td colSpan={6} className="px-10 py-32 text-center text-slate-700 font-black uppercase tracking-[0.3em] italic">Archive vault currently empty.</td></tr>}
                     </tbody>
                  </table>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* Floating Action Button for return */}
      <footer className="fixed bottom-10 right-10 z-50">
        {activeTab !== 'dashboard' && (
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className="w-20 h-20 basketball-gradient rounded-full flex items-center justify-center text-white shadow-2xl shadow-rose-500/50 hover:scale-110 active:scale-95 transition-all hover:rotate-12 border-4 border-white/20"
          >
            <LayoutDashboard size={32} />
          </button>
        )}
      </footer>
    </div>
  );
};

export default App;
