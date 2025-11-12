import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Trophy, Calendar, ArrowRight, History as HistoryIcon } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { RetroCard } from '@/components/RetroCard';
import { storage } from '@/lib/storage';
import { Leaderboard } from '@/lib/types';
import { format } from 'date-fns';

const History = () => {
  const navigate = useNavigate();
  const [leaderboards, setLeaderboards] = useState<Leaderboard[]>([]);

  useEffect(() => {
    loadLeaderboards();
  }, []);

  const loadLeaderboards = () => {
    const data = storage.getLeaderboards();
    // Sort by last updated (most recent first)
    const sorted = [...data].sort((a, b) => b.updatedAt - a.updatedAt);
    setLeaderboards(sorted);
  };

  const getRecentLeaderboards = () => {
    // Get leaderboards updated in last 7 days
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return leaderboards.filter(lb => lb.updatedAt >= sevenDaysAgo);
  };

  const getThisWeekLeaderboards = () => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return leaderboards.filter(lb => lb.updatedAt >= sevenDaysAgo);
  };

  const getThisMonthLeaderboards = () => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return leaderboards.filter(lb => lb.updatedAt >= thirtyDaysAgo);
  };

  const formatDate = (timestamp: number) => {
    try {
      return format(new Date(timestamp), 'dd MMM yyyy, HH:mm');
    } catch {
      return 'Unknown';
    }
  };

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    if (days < 7) return `${days} hari lalu`;
    return formatDate(timestamp);
  };

  const recentLeaderboards = getRecentLeaderboards();
  const thisWeekLeaderboards = getThisWeekLeaderboards();
  const thisMonthLeaderboards = getThisMonthLeaderboards();

  if (leaderboards.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8 pb-navbar relative scanlines">
        <div className="max-w-4xl mx-auto">
          <PageHeader title="HISTORY" />
          <RetroCard className="text-center py-12">
            <Clock className="mx-auto mb-4 text-muted-foreground" size={48} />
            <p className="text-muted-foreground mb-6 text-xs sm:text-sm">
              BELUM ADA HISTORY
            </p>
            <p className="text-muted-foreground text-[10px]">
              Leaderboard yang sudah dibuat akan muncul di sini
            </p>
          </RetroCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8 pb-navbar relative scanlines">
      <div className="max-w-4xl mx-auto">
        <PageHeader title="HISTORY" />

        {/* Recent Activity */}
        {recentLeaderboards.length > 0 && (
          <div className="mb-6">
            <h2 className="text-primary text-sm uppercase mb-4 flex items-center gap-2">
              <Clock size={16} />
              AKTIVITAS TERBARU
            </h2>
            <div className="space-y-3">
              {recentLeaderboards.slice(0, 5).map((lb) => (
                <RetroCard
                  key={lb.id}
                  className="cursor-pointer hover:scale-[1.02] transition-transform"
                  onClick={() => navigate(`/leaderboard/${lb.id}`)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="text-accent shrink-0" size={16} />
                        <h3 className="text-primary text-xs sm:text-sm uppercase truncate">
                          {lb.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatRelativeTime(lb.updatedAt)}
                        </span>
                        <span>{lb.players.length} pemain</span>
                      </div>
                    </div>
                    <ArrowRight className="text-muted-foreground shrink-0" size={16} />
                  </div>
                </RetroCard>
              ))}
            </div>
          </div>
        )}

        {/* All Leaderboards by Date */}
        <div className="mb-6">
          <h2 className="text-primary text-sm uppercase mb-4 flex items-center gap-2">
            <HistoryIcon size={16} />
            SEMUA LEADERBOARD
          </h2>
          <div className="space-y-3">
            {leaderboards.map((lb) => (
              <RetroCard
                key={lb.id}
                className="cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={() => navigate(`/leaderboard/${lb.id}`)}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="text-accent shrink-0" size={16} />
                      <h3 className="text-primary text-xs sm:text-sm uppercase truncate">
                        {lb.name}
                      </h3>
                    </div>
                    {lb.description && (
                      <p className="text-muted-foreground text-[10px] mb-2 line-clamp-1">
                        {lb.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        Dibuat: {formatDate(lb.createdAt)}
                      </span>
                      <span>•</span>
                      <span>Update: {formatRelativeTime(lb.updatedAt)}</span>
                      <span>•</span>
                      <span>{lb.players.length} pemain</span>
                    </div>
                  </div>
                  <ArrowRight className="text-muted-foreground shrink-0" size={16} />
                </div>
              </RetroCard>
            ))}
          </div>
        </div>

        {/* Statistics Summary */}
        <RetroCard className="mt-6">
          <h3 className="text-primary text-xs uppercase mb-4">RINGKASAN</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-accent text-lg sm:text-xl font-bold">
                {leaderboards.length}
              </div>
              <div className="text-muted-foreground text-[10px] mt-1">
                TOTAL GAME
              </div>
            </div>
            <div>
              <div className="text-accent text-lg sm:text-xl font-bold">
                {thisWeekLeaderboards.length}
              </div>
              <div className="text-muted-foreground text-[10px] mt-1">
                MINGGU INI
              </div>
            </div>
            <div>
              <div className="text-accent text-lg sm:text-xl font-bold">
                {thisMonthLeaderboards.length}
              </div>
              <div className="text-muted-foreground text-[10px] mt-1">
                BULAN INI
              </div>
            </div>
            <div>
              <div className="text-accent text-lg sm:text-xl font-bold">
                {leaderboards.reduce((sum, lb) => sum + lb.players.length, 0)}
              </div>
              <div className="text-muted-foreground text-[10px] mt-1">
                TOTAL PEMAIN
              </div>
            </div>
          </div>
        </RetroCard>
      </div>
    </div>
  );
};

export default History;

