
import type { ReactNode } from 'react';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Navbar can be included here if students need a different one, or reuse existing */}
      {/* <Navbar /> */}
      <main className="flex-1 animate-fadeIn pt-16"> {/* Add pt-16 if using sticky navbar from root */}
        {children}
      </main>
      {/* Footer can be included here if students need a different one, or reuse existing */}
      {/* <Footer /> */}
    </div>
  );
}
