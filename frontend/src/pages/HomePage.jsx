import { AppShell } from '@mantine/core';
import AppHeader from '../components/layout/AppHeader';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/home/HeroSection';

export default function HomePage() {
  return (
    <AppShell
      padding={0}
      header={<AppHeader />}
      footer={<Footer />}
      styles={(theme) => ({
        main: {
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
          minHeight: 'calc(100vh - 130px)',
        },
      })}
    >
      <Navbar />
      <HeroSection />
    </AppShell>
  );
}
