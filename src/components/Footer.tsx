import React from 'react';

const Footer: React.FC = () => (
  <footer className="border-t border-border bg-background">
    <div className="mx-auto flex w-[min(var(--container),calc(100%-32px))] flex-col gap-2 py-10 text-sm text-muted-foreground">
      <p>© Kinh Dịch AI Free — prototype concept.</p>
      <p>
        Trang này dùng để tham khảo, phản tư và ra quyết định có ý thức.
        Không thay thế chuyên gia trong các vấn đề pháp lý, y tế, tài chính hoặc an toàn cá nhân.
      </p>
    </div>
  </footer>
);

export default Footer;
