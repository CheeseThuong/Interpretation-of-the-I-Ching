import React, { useState } from 'react';

export type TabType = 'home' | 'kinhdich' | 'tarot' | 'journal';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const NAV_LINKS: { id: TabType; label: string }[] = [
  { id: 'home', label: 'Trang chủ' },
  { id: 'kinhdich', label: 'Kinh Dịch' },
  { id: 'tarot', label: 'Tarot' },
  { id: 'journal', label: 'Nhật ký tâm linh' },
];

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleTabClick = (e: React.MouseEvent, id: TabType) => {
    e.preventDefault();
    setActiveTab(id);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="site-header" id="siteHeader">
      <div className="header-inner">
        <a href="#" className="logo" aria-label="Về trang chủ" onClick={(e) => handleTabClick(e, 'home')}>
          <span className="logo-mark">易</span>
          <span>Kinh Dịch AI</span>
        </a>

        <nav className="desktop-nav" aria-label="Điều hướng chính">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href="#"
              className={`nav-link ${activeTab === link.id ? 'active' : ''}`}
              onClick={(e) => handleTabClick(e, link.id)}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          className={`menu-button${menuOpen ? ' open' : ''}`}
          id="menuButton"
          aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="menu-icon" />
        </button>
      </div>

      <nav
        className={`mobile-nav${menuOpen ? ' open' : ''}`}
        id="mobileNav"
        aria-label="Điều hướng mobile"
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.id}
            href="#"
            className={`mobile-nav-link ${activeTab === link.id ? 'active' : ''}`}
            onClick={(e) => handleTabClick(e, link.id)}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
};

export default Header;
