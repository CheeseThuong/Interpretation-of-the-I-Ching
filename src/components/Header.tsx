import React, { useState } from 'react';

const NAV_LINKS = [
  { href: '#home',     label: 'Trang chủ' },
  { href: '#reading',  label: 'Luận quẻ AI' },
  { href: '#coins',    label: 'Lập lục hào' },
  { href: '#decision', label: 'Random quyết định' },
  // { href: '#data',     label: 'Nguồn data' },
  { href: '#gallery',  label: 'Gallery' },
];

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMobile = () => setMenuOpen(false);

  return (
    <header className="site-header" id="siteHeader">
      <div className="header-inner">
        <a href="#home" className="logo" aria-label="Về trang chủ">
          <span className="logo-mark">易</span>
          <span>Kinh Dịch AI</span>
        </a>

        <nav className="desktop-nav" aria-label="Điều hướng chính">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="nav-link">
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
          <a key={link.href} href={link.href} className="mobile-nav-link" onClick={closeMobile}>
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
};

export default Header;
