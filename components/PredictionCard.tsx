
import React from 'react';
import { PredictionResult } from '../types';
import { Save, CheckCircle2, ChevronRight, Star, Share2, MapPin, Users, Info, Calendar } from 'lucide-react';

interface PredictionCardProps {
  prediction: PredictionResult;
  onSave?: () => void;
  isSaved?: boolean;
}

const PredictionCard: React.FC<PredictionCardProps> = ({ prediction, onSave, isSaved }) => {
  const teamA = prediction.matchup.split(' vs ')[0];
  const teamB = prediction.matchup.split(' vs ')[1];

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-lg overflow-hidden shadow-2xl transition-all hover:border-slate-700 w-full max-w-2xl mx-auto flex flex-col">
      
      {/* Top App Bar Simulation */}
      <div className="bg-[#0f172a] px-4 py-3 border-b border-slate-800 flex items-center justify-between text-white">
        <div className="flex items-center gap-4">
          <ChevronRight className="rotate-180 cursor-pointer text-slate-400" size={24} />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 basketball-gradient rounded-full flex items-center justify-center">
               <span className="text-[10px] font-bold">🏀</span>
            </div>
            <span className="font-bold text-sm tracking-tight">Basketball Prediction</span>
            <ChevronRight className="rotate-90 text-slate-500" size={14} />
          </div>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <Share2 size={20} className="hover:text-white cursor-pointer" />
          <Star size={20} className="hover:text-yellow-400 cursor-pointer" />
        </div>
      </div>

      {/* League & Round Banner */}
      <div className="bg-[#1e293b] px-4 py-3 flex items-center justify-between group cursor-pointer hover:bg-[#334155] transition-colors border-b border-slate-800">
        <div className="flex items-center gap-2">
           <div className="w-5 h-5 bg-blue-600 rounded-sm flex items-center justify-center text-[10px] font-bold">EU</div>
           <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">
             {prediction.league} {prediction.round ? `- ${prediction.round}` : '- PROJECTED'}
           </span>
        </div>
        <ChevronRight size={18} className="text-slate-500 group-hover:text-white" />
      </div>

      {/* Scoreboard Block */}
      <div className="p-8 bg-slate-900/40 relative flex flex-col items-center">
        <div className="text-[11px] text-slate-500 font-bold mb-6 font-mono">
          {new Date(prediction.timestamp).toLocaleDateString('de-DE')} {new Date(prediction.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>

        <div className="w-full flex items-center justify-between px-4">
          {/* Team A */}
          <div className="flex flex-col items-center flex-1 space-y-3">
            <div className="relative">
              <Star className="absolute -left-10 top-6 text-slate-700 hover:text-yellow-500 cursor-pointer" size={20} />
              <div className="w-20 h-20 bg-[#f8fafc] rounded-2xl flex items-center justify-center shadow-lg border border-slate-700 p-2 overflow-hidden">
                <div className="w-full h-full bg-slate-200 rounded-full flex items-center justify-center text-3xl font-black text-slate-400">
                  {teamA[0]}
                </div>
              </div>
            </div>
            <h4 className="text-lg font-black text-white brand-font uppercase tracking-tight text-center">
              {teamA}
            </h4>
          </div>

          {/* Center Score */}
          <div className="flex flex-col items-center px-4">
            <div className="text-6xl font-black text-white brand-font tracking-tighter flex items-center gap-4 tabular-nums">
              <span>{prediction.predictedScore.teamA}</span>
              <span className="text-slate-700">-</span>
              <span>{prediction.predictedScore.teamB}</span>
            </div>
            <div className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mt-3">
              AI Projected
            </div>
          </div>

          {/* Team B */}
          <div className="flex flex-col items-center flex-1 space-y-3">
            <div className="relative">
              <Star className="absolute -right-10 top-6 text-slate-700 hover:text-yellow-500 cursor-pointer" size={20} />
              <div className="w-20 h-20 bg-[#f8fafc] rounded-2xl flex items-center justify-center shadow-lg border border-slate-700 p-2 overflow-hidden">
                <div className="w-full h-full bg-slate-200 rounded-full flex items-center justify-center text-3xl font-black text-slate-400">
                  {teamB[0]}
                </div>
              </div>
            </div>
            <h4 className="text-lg font-black text-white brand-font uppercase tracking-tight text-center">
              {teamB}
            </h4>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex w-full mt-10 border-b border-slate-800 scrollbar-hide overflow-x-auto">
          {['SUMMARY', 'PLAYER STATISTICS', 'STATS', 'LINEUPS', 'POINTS'].map((tab, i) => (
            <div key={tab} className={`px-5 py-3 text-[11px] font-black tracking-widest whitespace-nowrap cursor-pointer transition-colors ${i === 0 ? 'text-rose-500 border-b-2 border-rose-500' : 'text-slate-500 hover:text-slate-300'}`}>
              {tab}
            </div>
          ))}
        </div>
      </div>

      {/* Quarter Breakdown Section */}
      <div className="bg-[#111827] px-6 py-6 border-b border-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <th className="text-left pb-4 font-black">Match Progress</th>
              <th className="text-center pb-4 w-12 font-black">S</th>
              <th className="text-center pb-4 w-12 font-black">1</th>
              <th className="text-center pb-4 w-12 font-black">2</th>
              <th className="text-center pb-4 w-12 font-black">3</th>
              <th className="text-center pb-4 w-12 font-black">4</th>
            </tr>
          </thead>
          <tbody className="text-white font-medium">
            <tr className="border-b border-slate-800/50">
              <td className="py-3 font-bold text-slate-200">{teamA}</td>
              <td className="py-3 text-center font-black text-base">{prediction.predictedScore.teamA}</td>
              {prediction.quarterScores?.teamA.map((q, i) => <td key={i} className="py-3 text-center text-slate-400 tabular-nums">{q}</td>)}
            </tr>
            <tr>
              <td className="py-3 font-bold text-slate-200">{teamB}</td>
              <td className="py-3 text-center font-black text-base">{prediction.predictedScore.teamB}</td>
              {prediction.quarterScores?.teamB.map((q, i) => <td key={i} className="py-3 text-center text-slate-400 tabular-nums">{q}</td>)}
            </tr>
          </tbody>
        </table>
      </div>

      {/* ODDS Section */}
      <div className="bg-[#1e293b]/30 p-6 space-y-4">
        <div className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center justify-between">
          <span>AI Predictive Odds</span>
          <span className="text-emerald-500">{prediction.confidence}% Confidence</span>
        </div>

        {/* Row 1: Winning Probability */}
        <div className="flex h-14 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden group">
           <div className="w-24 px-4 flex items-center justify-center bg-slate-800/80 border-r border-slate-700">
              <div className="text-blue-400 font-black italic text-xs tracking-tighter">AI-MODEL</div>
           </div>
           {/* Option 1 */}
           <div className={`flex-1 flex items-center justify-between px-6 transition-all cursor-pointer ${prediction.winner.includes(teamA) ? 'bg-[#fbbf24] text-black font-black' : 'hover:bg-slate-800 text-slate-400'}`}>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold opacity-60">1</span>
                <span className="text-sm font-bold uppercase tracking-tight">{teamA}</span>
              </div>
              <span className="text-base font-black">{(prediction.confidence / 10).toFixed(2)}</span>
           </div>
           {/* Option 2 */}
           <div className={`flex-1 flex items-center justify-between px-6 transition-all cursor-pointer ${!prediction.winner.includes(teamA) ? 'bg-[#fbbf24] text-black font-black' : 'hover:bg-slate-800 text-slate-400'}`}>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold opacity-60">2</span>
                <span className="text-sm font-bold uppercase tracking-tight">{teamB}</span>
              </div>
              <span className="text-base font-black">{(10 - prediction.confidence / 10).toFixed(2)}</span>
           </div>
        </div>

        {/* Row 2: Over/Under */}
        <div className="flex h-14 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden group">
           <div className="w-24 px-4 flex items-center justify-center bg-slate-800/80 border-r border-slate-700">
              <div className="text-rose-500 font-black italic text-xs tracking-tighter">TOTALS</div>
           </div>
           <div className="flex-1 flex items-center justify-between px-6 hover:bg-slate-800 transition-all cursor-pointer text-slate-400 border-r border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold opacity-60">O</span>
                <span className="text-sm font-bold uppercase tracking-tight">Over</span>
              </div>
              <span className="text-base font-black text-slate-200">{prediction.totalPoints}.5</span>
           </div>
           <div className="flex-1 flex items-center justify-between px-6 hover:bg-slate-800 transition-all cursor-pointer text-slate-400">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold opacity-60">U</span>
                <span className="text-sm font-bold uppercase tracking-tight">Under</span>
              </div>
              <span className="text-base font-black text-slate-200">{prediction.totalPoints}.5</span>
           </div>
        </div>
      </div>

      {/* Match Information Section */}
      <div className="bg-[#111827] p-6 space-y-6">
        <div className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Match Information</div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4 text-slate-400">
              <Users size={16} className="text-slate-600" />
              <span className="text-[13px] font-medium">Referee</span>
            </div>
            <div className="text-right space-y-1">
              {prediction.officials?.map((off, idx) => (
                <div key={idx} className="flex items-center justify-end gap-2 text-[13px] font-bold text-white">
                  <span>{off}</span>
                  <div className={`w-4 h-3 bg-slate-700 rounded-sm overflow-hidden flex items-center justify-center text-[6px] font-bold`}>EU</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 text-slate-400">
              <MapPin size={16} className="text-slate-600" />
              <span className="text-[13px] font-medium">Venue</span>
            </div>
            <span className="text-[13px] font-bold text-white text-right">
              {prediction.venue || 'Continental Arena'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 text-slate-400">
              <Info size={16} className="text-slate-600" />
              <span className="text-[13px] font-medium">Predicted Attendance</span>
            </div>
            <span className="text-[13px] font-bold text-white">
              {prediction.attendance || '15,000+'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Legal / Disclaimer */}
      <div className="p-4 bg-slate-950 border-t border-slate-900 flex flex-col items-center gap-2">
        <div className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">
          Probabilistic AI Model. Analyze Responsibly. 18+
        </div>
        
        <div className="w-full flex justify-between items-center mt-2">
           <div className="flex items-center gap-3">
              <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest">
                Safe Projection
              </div>
           </div>
           
           {onSave && (
              <button 
                onClick={onSave}
                disabled={isSaved}
                className={`flex items-center gap-2 px-6 py-2 rounded-md text-[11px] font-black uppercase transition-all ${
                  isSaved 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default' 
                  : 'bg-rose-600 text-white hover:bg-rose-500 shadow-xl shadow-rose-900/30 active:scale-95'
                }`}
              >
                {isSaved ? <><CheckCircle2 size={14} /> Report Filed</> : <><Save size={14} /> Log Archive</>}
              </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;
