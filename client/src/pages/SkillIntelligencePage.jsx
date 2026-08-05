import React, { useState, useEffect } from 'react';
import { BrainCircuit, Calendar, TrendingUp, AlertTriangle, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import api from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { AIBadge } from '../components/common/AIBadge';

export const SkillIntelligencePage = () => {
  const [timeframe, setTimeframe] = useState(14);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchForecast = async (days) => {
    setLoading(true);
    try {
      const res = await api.post('/ai/forecast-capacity', { timeframe_days: days });
      setForecastData(res.data);
    } catch (err) {
      console.error('Error fetching capacity forecast:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast(timeframe);
  }, [timeframe]);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Skill Intelligence & Capacity Forecasting</h1>
            <AIBadge label="Predictive Demand Engine" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Machine learning predictions matching expected patient appointment demand against qualified staff hours 7, 14, and 30 days ahead.
          </p>
        </div>

        {/* Timeframe Selector Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold self-start sm:self-auto">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              onClick={() => setTimeframe(days)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeframe === days
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {days} Days Ahead
            </button>
          ))}
        </div>
      </div>

      {loading || !forecastData ? (
        <div className="flex items-center justify-center h-64 text-sky-400 font-semibold gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" /> Running Predictive Capacity Neural Model...
        </div>
      ) : (
        <>
          {/* Summary Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Forecasted Avg Utilization"
              value={forecastData.summary.averageUtilization}
              unit="%"
              icon={TrendingUp}
              trend="Optimal Chair Loading"
              trendType="positive"
            />
            <StatCard
              title="Identified Shift Shortages"
              value={forecastData.summary.shortageDaysCount}
              unit="Days"
              icon={AlertTriangle}
              trend={forecastData.summary.shortageDaysCount > 0 ? 'Coverage Action Needed' : 'Fully Covered'}
              trendType={forecastData.summary.shortageDaysCount > 0 ? 'negative' : 'positive'}
            />
            <StatCard
              title="Peak Patient Demand Day"
              value={forecastData.summary.peakDemandDay}
              icon={Calendar}
              description="Highest chair allocation demand"
            />
          </div>

          {/* Forecast Recharts Bar Graph */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-sky-400" /> {timeframe}-Day Patient Demand vs Staff Availability Forecast
                </h3>
                <p className="text-xs text-slate-400">Comparing required appointment hours against available practitioner capacity.</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1 text-sky-400">
                  <span className="w-3 h-3 bg-sky-500 rounded inline-block"></span> Required Demand (Hrs)
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-3 h-3 bg-emerald-500 rounded inline-block"></span> Staff Availability (Hrs)
                </span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecastData.forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="patientDemandHours" fill="#0284c7" radius={[4, 4, 0, 0]} name="Patient Demand Hours" />
                  <Bar dataKey="availableStaffHours" fill="#10b981" radius={[4, 4, 0, 0]} name="Available Staff Hours" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Capacity Optimization Insights */}
          <div className="p-5 bg-gradient-to-r from-sky-950/40 via-indigo-950/40 to-slate-900 border border-sky-500/30 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-sky-400 font-extrabold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-sky-300 animate-pulse" /> Grok AI Capacity Reallocation Insight
            </div>
            <p className="text-sm font-semibold text-white leading-relaxed">{forecastData.summary.aiRecommendation}</p>
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Chair-to-practitioner ratio optimized at 1.25 chairs per associate dentist.</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
