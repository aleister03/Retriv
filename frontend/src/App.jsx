import { AppShell, useMantineColorScheme } from '@mantine/core';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/home';

function App() {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <AppShell
      header={{ height: 60 }}
      footer={{ height: 'auto' }}
      padding={0}
      style={{
        background: isDark ? '#0E1424' : '#F7F8FF',
      }}
    >
      <AppShell.Header>
        <Navbar />
      </AppShell.Header>

      <AppShell.Main
        style={{
          background: isDark ? '#0E1424' : '#F7F8FF',
          minHeight: 'calc(100vh - 120px)',
        }}
      >
        <Home />
      </AppShell.Main>

      <AppShell.Footer>
        <Footer />
      </AppShell.Footer>
    </AppShell>
  );
}

export default App;

