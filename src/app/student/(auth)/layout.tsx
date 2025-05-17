
import type { ReactNode } from 'react';

export default function StudentAuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-6 md:p-8 bg-gradient-to-br from-background to-secondary/20">
      {children}
    </div>
  );
}
