import React, { useState } from 'react';
import {
  CATEGORIES,
  MOODS,
  MOOD_DETAILS,
} from '../data/activities';
import {
  Sparkles,
  Clock,
  Zap,
  ArrowRight,
  Filter,
  CheckCircle,
  Play,
  RotateCw,
  Heart,
  Flame,
  Wind,
  Activity,
  PenTool,
  Droplets,
  Moon,
  Palette,
  Users,
  Sun,
  ShieldCheck,
  Compass,
  Layers,
  Share2,
  Coffee,
  UserCheck,
  Search,
  Anchor,
  HeartHandshake,
  Feather,
} from 'lucide-react';

const ICON_MAP = {
  Wind,
  Activity,
  PenTool,
  MessageCircle: Users,
  Droplets,
  Moon,
  Palette,
  Users,
  Sparkles,
  HeartHandshake,
  Zap,
  Sun,
  Compass,
  ShieldCheck,
  Layers,
  Share2,
  Heart,
  Feather,
  Coffee,
  UserCheck,
  Search,
  Anchor,
};

export default function RecommendationGrid({
  activities,
  currentMood,
  onSelectActivity,
  onShuffle,
}) {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES.ALL);
  const currentMoodInfo = MOOD_DETAILS[currentMood] || MOOD_DETAILS[MOODS.NEUTRAL];

  // Filter activities matching current mood
  const moodActivities = activities.filter((act) => act.mood === currentMood);

  // Then filter by category if not 'all'
  const filteredActivities = moodActivities.filter((act) => {
    if (activeCategory === CATEGORIES.ALL) return true;
    return act.category === activeCategory;
  });

  const categoriesList = [
    CATEGORIES.ALL,
    CATEGORIES.MINDFULNESS,
    CATEGORIES.PHYSICAL,
    CATEGORIES.CREATIVE,
    CATEGORIES.SOCIAL,
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Grid Top Navigation / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Adaptive Recommendations
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-medium">
              Matched to {currentMoodInfo.label.split('/')[0].trim()}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Personalized micro-actions designed to optimize your cognitive & emotional state
          </p>
        </div>

        {/* Shuffle / Refresh button */}
        <button
          onClick={onShuffle}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition cursor-pointer"
          title="Shuffle or regenerate activity suggestions"
        >
          <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
          <span>Shuffle Options</span>
        </button>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categoriesList.map((cat) => {
          const isSelected = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/25'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              {cat === CATEGORIES.ALL ? 'All Categories' : cat}
            </button>
          );
        })}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity, index) => {
            const IconComponent = ICON_MAP[activity.icon] || Sparkles;

            return (
              <div
                key={activity.id}
                onClick={() => onSelectActivity(activity)}
                className="group relative flex flex-col justify-between p-6 rounded-3xl glass-panel border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-800/40 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer overflow-hidden"
              >
                {/* Number index indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  {index === 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-medium">
                      Top Pick
                    </span>
                  )}
                  <span className="text-slate-600 font-mono text-xs">#{index + 1}</span>
                </div>

                <div>
                  {/* Category & Duration badges */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-slate-800 text-indigo-300 border border-slate-700/80">
                      {activity.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {activity.duration}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-transform">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors">
                        {activity.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {activity.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  {activity.tags && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {activity.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900/60 text-slate-400 border border-slate-800 font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer action */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Launch Activity <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full p-8 text-center glass-panel rounded-3xl border border-slate-800">
            <p className="text-sm text-slate-400">
              No recommendations found in this category for {currentMood}.
            </p>
            <button
              onClick={() => setActiveCategory(CATEGORIES.ALL)}
              className="mt-3 text-xs text-indigo-400 hover:underline cursor-pointer"
            >
              Show all categories
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
