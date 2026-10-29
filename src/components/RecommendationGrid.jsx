import React, { useState } from 'react';
import {
  CATEGORIES,
  MOODS,
  MOOD_DETAILS,
} from '../data/activities';
import {
  Clock,
  Zap,
  ArrowRight,
  RotateCw,
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
  HeartHandshake,
  Zap,
  Sun,
  Compass,
  ShieldCheck,
  Layers,
  Share2,
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
    <div className="flex flex-col gap-4">
      {/* Grid Top Navigation / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-semibold text-white tracking-tight">
              Adaptive Activity Protocols
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              State: {currentMoodInfo.label.split('/')[0].trim()}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Structured task interventions matched to current expression classification
          </p>
        </div>

        {/* Shuffle / Refresh button */}
        <button
          onClick={onShuffle}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition cursor-pointer"
          title="Regenerate action recommendations"
        >
          <RotateCw className="w-3.5 h-3.5 text-blue-400" />
          <span>Shuffle Options</span>
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categoriesList.map((cat) => {
          const isSelected = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition cursor-pointer border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat === CATEGORIES.ALL ? 'All Categories' : cat}
            </button>
          );
        })}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity, index) => {
            const IconComponent = ICON_MAP[activity.icon] || Activity;

            return (
              <div
                key={activity.id}
                onClick={() => onSelectActivity(activity)}
                className="group relative flex flex-col justify-between p-5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850 transition cursor-pointer shadow-sm"
              >
                {/* Index tag */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  {index === 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                      Recommended
                    </span>
                  )}
                  <span className="text-slate-500 font-mono text-[11px]">#{index + 1}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="p-2 rounded bg-slate-800 border border-slate-700 text-blue-400 group-hover:text-blue-300 transition">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-mono uppercase tracking-wide text-slate-400">
                      {activity.category}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-100 group-hover:text-blue-400 transition mb-1 leading-snug">
                    {activity.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {activity.subtitle}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{activity.duration}</span>
                  </div>

                  <span className="flex items-center gap-1 text-blue-400 font-medium group-hover:translate-x-0.5 transition-transform text-xs">
                    <span>Execute</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs font-mono">
            No activities matching selected category.
          </div>
        )}
      </div>
    </div>
  );
}
