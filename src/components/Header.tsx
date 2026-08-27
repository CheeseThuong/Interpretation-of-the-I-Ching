import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

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

  const goToTab = (id: TabType) => {
    setActiveTab(id);
    setMenuOpen(false);

    // Update URL to match tab without reloading
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('tab', id);
    newUrl.searchParams.delete('mode'); // cleanup mode if jumping to a different tab
    window.history.pushState({}, '', newUrl.toString());

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      id="siteHeader"
      className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl"
    >
      <div className="mx-auto flex min-h-[76px] w-[min(var(--container),calc(100%-32px))] items-center justify-between gap-6">
        <a
          href="#"
          aria-label="Về trang chủ"
          className="inline-flex items-center gap-2.5 font-heading text-lg font-bold tracking-tight text-foreground"
          onClick={(e) => {
            e.preventDefault();
            goToTab('home');
          }}
        >
          <span className="grid size-[38px] place-items-center rounded-2xl border border-[var(--border-gold)] bg-card font-black text-[var(--gold-soft)]">
            易
          </span>
          <span>Kinh Dịch AI</span>
        </a>

        <nav
          aria-label="Điều hướng chính"
          className="hidden items-center gap-1 md:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                goToTab(link.id);
              }}
              className={cn(
                'rounded-2xl px-3 py-2.5 text-[0.92rem] font-bold text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground',
                activeTab === link.id &&
                  'bg-accent text-accent-foreground shadow-[inset_0_0_0_1px_var(--border-gold)] hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
                className="md:hidden"
              />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right" className="border-border bg-background">
            <SheetHeader>
              <SheetTitle>Điều hướng</SheetTitle>
            </SheetHeader>
            <nav aria-label="Điều hướng mobile" className="flex flex-col gap-2 px-4 pb-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.id}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    goToTab(link.id);
                  }}
                  className={cn(
                    'rounded-2xl px-4 py-3.5 text-[0.95rem] font-bold text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground',
                    activeTab === link.id && 'bg-accent text-accent-foreground',
                  )}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
