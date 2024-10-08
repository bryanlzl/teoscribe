import { useEffect } from 'react';
import useTheme from './stores/useTheme';
import LayoutHeader from './components/layoutHeader';
import LayoutContent from './components/layoutContent';

const App = (): JSX.Element => {
  const [theme] = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div
      data-theme={theme}
      className="flex flex-col justify-center items-center h-[100vh] bg-base-100 text-base-content"
    >
      <LayoutHeader />
      <LayoutContent />
    </div>
  );
};

export default App;
