import HeaderAlert from '@/app/components/frontend-pages/shared/header/HeaderAlert';
import HpHeader from '@/app/components/frontend-pages/shared/header/HpHeader';
import Footer from '@/app/components/frontend-pages/shared/footer';
import ScrollToTop from '@/app/components/frontend-pages/shared/scroll-to-top';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderAlert />
      <HpHeader />
      <main>{children}</main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
