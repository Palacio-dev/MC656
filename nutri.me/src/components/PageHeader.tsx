import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import '../styles/PageHeader.css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  showSettingsButton?: boolean;
  showThemeToggle?: boolean;
}

/**
 * Reusable page header component with navigation buttons
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBackButton = true,
  showHomeButton = true,
  showSettingsButton = false,
  showThemeToggle = true,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleHome = () => {
    navigate('/Welcome');
  };

  const handleSettings = () => {
    navigate('/Settings');
  }

  return (
    <div className="page-header">
      <div className="page-header-nav">
        {showBackButton && (
          <button 
            onClick={handleBack} 
            className="nav-btn back-btn" 
            aria-label="Voltar"
            title="Voltar"
          >
            ← Voltar
          </button>
        )}
        {showHomeButton && (
          <button 
            onClick={handleHome} 
            className="nav-btn home-btn" 
            aria-label="Ir para início"
            title="Ir para início"
          >
            🏠 Início
          </button>
        )}
        {showSettingsButton && (
          <button 
            onClick={handleSettings}
            className="nav-btn settings-btn"
            aria-label="Configurações"
            title="Configurações"
          >
            ⚙️ Configurações
          </button>
        )}
        {showThemeToggle && (
          <div className="page-header-theme">
            <ThemeToggle />
          </div>
        )}
      </div>
      <div className="page-header-content">
        <h1 className="page-header-title">{title}</h1>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
};
