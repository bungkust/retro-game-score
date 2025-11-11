import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { RetroButton } from '@/components/RetroButton';
import { RetroCard } from '@/components/RetroCard';
import { storage } from '@/lib/storage';
import { Leaderboard, ScoreMode, SortOrder } from '@/lib/types';
import { soundPlayer } from '@/lib/sounds';
import { toast } from 'sonner';

const CreateLeaderboard = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    scoreMode: 'win_count' as ScoreMode,
    sortOrder: 'highest' as SortOrder,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      soundPlayer.playError();
      toast.error('NAMA GAME HARUS DIISI!');
      return;
    }

    const newLeaderboard: Leaderboard = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      scoreMode: formData.scoreMode,
      sortOrder: formData.sortOrder,
      players: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    storage.addLeaderboard(newLeaderboard);
    soundPlayer.playSuccess();
    toast.success('LEADERBOARD DIBUAT!');
    navigate(`/leaderboard/${newLeaderboard.id}`);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8 relative scanlines">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="BUAT LEADERBOARD BARU" showBack />

        <RetroCard className="animate-pixel-slide-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-primary text-xs sm:text-sm mb-2 uppercase">
                * NAMA GAME
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-muted text-foreground border-2 border-border px-3 py-2 text-xs sm:text-sm focus:border-primary focus:outline-none"
                placeholder="Contoh: UNO KELUARGA"
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-primary text-xs sm:text-sm mb-2 uppercase">
                DESKRIPSI / ATURAN
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-muted text-foreground border-2 border-border px-3 py-2 text-xs sm:text-sm focus:border-primary focus:outline-none min-h-[80px]"
                placeholder="Aturan main (opsional)"
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-primary text-xs sm:text-sm mb-3 uppercase">
                * MODE SKOR
              </label>
              <div className="space-y-2">
                <label className="flex items-start gap-3 cursor-pointer p-3 border-2 border-border hover:border-primary transition-colors">
                  <input
                    type="radio"
                    name="scoreMode"
                    value="win_count"
                    checked={formData.scoreMode === 'win_count'}
                    onChange={(e) => setFormData({ ...formData, scoreMode: e.target.value as ScoreMode })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="text-accent text-xs sm:text-sm uppercase">JUMLAH KEMENANGAN</div>
                    <div className="text-muted-foreground text-[10px] mt-1">
                      Untuk UNO, Catur, dll. Tambah +1 per menang
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 border-2 border-border hover:border-primary transition-colors">
                  <input
                    type="radio"
                    name="scoreMode"
                    value="total_points"
                    checked={formData.scoreMode === 'total_points'}
                    onChange={(e) => setFormData({ ...formData, scoreMode: e.target.value as ScoreMode })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="text-accent text-xs sm:text-sm uppercase">TOTAL POIN</div>
                    <div className="text-muted-foreground text-[10px] mt-1">
                      Untuk Scrabble, atau waktu (detik)
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-primary text-xs sm:text-sm mb-3 uppercase">
                * ATURAN PENGURUTAN
              </label>
              <div className="space-y-2">
                <label className="flex items-start gap-3 cursor-pointer p-3 border-2 border-border hover:border-primary transition-colors">
                  <input
                    type="radio"
                    name="sortOrder"
                    value="highest"
                    checked={formData.sortOrder === 'highest'}
                    onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value as SortOrder })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="text-accent text-xs sm:text-sm uppercase">SKOR TERTINGGI MENANG</div>
                    <div className="text-muted-foreground text-[10px] mt-1">
                      Untuk game poin (semakin banyak semakin baik)
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 border-2 border-border hover:border-primary transition-colors">
                  <input
                    type="radio"
                    name="sortOrder"
                    value="lowest"
                    checked={formData.sortOrder === 'lowest'}
                    onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value as SortOrder })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="text-accent text-xs sm:text-sm uppercase">SKOR TERENDAH MENANG</div>
                    <div className="text-muted-foreground text-[10px] mt-1">
                      Untuk game waktu (semakin cepat semakin baik)
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <RetroButton
                type="button"
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex-1"
              >
                BATAL
              </RetroButton>
              <RetroButton
                type="submit"
                variant="primary"
                className="flex-1"
              >
                BUAT
              </RetroButton>
            </div>
          </form>
        </RetroCard>
      </div>
    </div>
  );
};

export default CreateLeaderboard;
