import { ArrowLeft } from 'lucide-react';
import { RetroButton } from './RetroButton';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  action?: React.ReactNode;
}

export const PageHeader = ({ title, showBack = false, action }: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-8 gap-4">
      <div className="flex items-center gap-4">
        {showBack && (
          <RetroButton
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">BACK</span>
          </RetroButton>
        )}
        <h1 className="text-lg sm:text-xl md:text-2xl text-primary glow-cyan uppercase tracking-wider">
          {title}
        </h1>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};
