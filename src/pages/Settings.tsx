import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Download, Upload, Trash2, Info, FileText, Database } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { RetroButton } from '@/components/RetroButton';
import { RetroCard } from '@/components/RetroCard';
import { storage } from '@/lib/storage';
import { soundPlayer } from '@/lib/sounds';
import { toast } from 'sonner';
import { Leaderboard } from '@/lib/types';

const Settings = () => {
  const [isMuted, setIsMuted] = useState(soundPlayer.isSoundMuted());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportInfo, setShowExportInfo] = useState(false);

  useEffect(() => {
    setIsMuted(soundPlayer.isSoundMuted());
  }, []);

  const handleToggleSound = () => {
    const newMutedState = soundPlayer.toggleMute();
    setIsMuted(newMutedState);
    if (!newMutedState) {
      soundPlayer.playSelect();
    }
    toast.success(newMutedState ? 'SUARA DIMATIKAN' : 'SUARA DIAKTIFKAN');
  };

  const handleExportData = () => {
    try {
      const leaderboards = storage.getLeaderboards();
      const dataStr = JSON.stringify(leaderboards, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `retro-game-score-backup-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      soundPlayer.playSuccess();
      toast.success('DATA BERHASIL DIEKSPOR!');
    } catch (error) {
      soundPlayer.playError();
      toast.error('GAGAL MENGEKSPOR DATA!');
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const importedData = JSON.parse(content) as Leaderboard[];
          
          // Validate data structure
          if (!Array.isArray(importedData)) {
            throw new Error('Invalid data format');
          }

          // Validate each leaderboard
          importedData.forEach((lb) => {
            if (!lb.id || !lb.name || !Array.isArray(lb.players)) {
              throw new Error('Invalid leaderboard structure');
            }
          });

          // Backup current data
          const currentData = storage.getLeaderboards();
          const backup = JSON.stringify(currentData);

          try {
            // Import new data
            storage.saveLeaderboards(importedData);
            soundPlayer.playSuccess();
            toast.success('DATA BERHASIL DIIMPOR!');
            // Reload page to reflect changes
            setTimeout(() => window.location.reload(), 1000);
          } catch (error) {
            // Restore backup on error
            storage.saveLeaderboards(JSON.parse(backup));
            throw error;
          }
        } catch (error) {
          soundPlayer.playError();
          toast.error('GAGAL MENGIMPOR DATA! Pastikan file valid.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearAllData = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      storage.saveLeaderboards([]);
      soundPlayer.playSuccess();
      toast.success('SEMUA DATA DIHAPUS!');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      soundPlayer.playError();
      toast.error('GAGAL MENGHAPUS DATA!');
    }
  };

  const leaderboards = storage.getLeaderboards();
  const totalGames = leaderboards.length;
  const totalPlayers = leaderboards.reduce((sum, lb) => sum + lb.players.length, 0);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8 pb-navbar relative scanlines">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="PENGATURAN" />

        {/* Sound Settings */}
        <RetroCard className="mb-4">
          <h3 className="text-primary text-xs uppercase mb-4">SUARA</h3>
          <RetroButton
            variant={isMuted ? 'ghost' : 'primary'}
            className="w-full flex items-center justify-center gap-2"
            onClick={handleToggleSound}
          >
            {isMuted ? (
              <>
                <VolumeX size={16} />
                AKTIFKAN SUARA
              </>
            ) : (
              <>
                <Volume2 size={16} />
                MATIKAN SUARA
              </>
            )}
          </RetroButton>
        </RetroCard>

        {/* Data Management */}
        <RetroCard className="mb-4">
          <h3 className="text-primary text-xs uppercase mb-4 flex items-center gap-2">
            <Database size={16} />
            MANAJEMEN DATA
          </h3>
          <div className="space-y-3">
            <RetroButton
              variant="secondary"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleExportData}
            >
              <Download size={16} />
              EKSPOR DATA
            </RetroButton>
            <RetroButton
              variant="secondary"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleImportData}
            >
              <Upload size={16} />
              IMPOR DATA
            </RetroButton>
          </div>
        </RetroCard>

        {/* Data Info */}
        <RetroCard className="mb-4">
          <h3 className="text-primary text-xs uppercase mb-4 flex items-center gap-2">
            <FileText size={16} />
            INFORMASI DATA
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Game:</span>
              <span className="text-foreground font-bold">{totalGames}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Pemain:</span>
              <span className="text-foreground font-bold">{totalPlayers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Storage:</span>
              <span className="text-foreground font-bold">LocalStorage</span>
            </div>
          </div>
        </RetroCard>

        {/* Danger Zone */}
        <RetroCard className="mb-4 border-destructive">
          <h3 className="text-destructive text-xs uppercase mb-4">ZONA BERBAHAYA</h3>
          {!showDeleteConfirm ? (
            <RetroButton
              variant="destructive"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleClearAllData}
            >
              <Trash2 size={16} />
              HAPUS SEMUA DATA
            </RetroButton>
          ) : (
            <div className="space-y-3">
              <p className="text-destructive text-xs">
                YAKIN HAPUS SEMUA DATA? TIDAK BISA DIBATALKAN!
              </p>
              <div className="flex gap-2">
                <RetroButton
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  BATAL
                </RetroButton>
                <RetroButton
                  variant="destructive"
                  className="flex-1"
                  onClick={handleClearAllData}
                >
                  YA, HAPUS
                </RetroButton>
              </div>
            </div>
          )}
        </RetroCard>

        {/* About */}
        <RetroCard>
          <h3 className="text-primary text-xs uppercase mb-4 flex items-center gap-2">
            <Info size={16} />
            TENTANG APLIKASI
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground">Nama:</span>
              <div className="text-foreground mt-1">Universal Leaderboard</div>
            </div>
            <div>
              <span className="text-muted-foreground">Deskripsi:</span>
              <div className="text-foreground mt-1">
                Satu Papan Skor untuk Semua Permainan
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Versi:</span>
              <div className="text-foreground mt-1">1.0.0</div>
            </div>
            <div>
              <span className="text-muted-foreground">Tipe:</span>
              <div className="text-foreground mt-1">Progressive Web App (PWA)</div>
            </div>
          </div>
        </RetroCard>

        {/* Export Info */}
        {showExportInfo && (
          <RetroCard className="mt-4">
            <h3 className="text-primary text-xs uppercase mb-2">CARA EKSPOR/IMPOR</h3>
            <div className="text-[10px] text-muted-foreground space-y-2">
              <p>1. Klik "EKSPOR DATA" untuk menyimpan backup ke file JSON</p>
              <p>2. Klik "IMPOR DATA" untuk memulihkan data dari file JSON</p>
              <p>3. File backup berisi semua leaderboard dan data pemain</p>
              <p>4. Pastikan file backup valid sebelum mengimpor</p>
            </div>
            <RetroButton
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => setShowExportInfo(false)}
            >
              TUTUP
            </RetroButton>
          </RetroCard>
        )}
      </div>
    </div>
  );
};

export default Settings;

