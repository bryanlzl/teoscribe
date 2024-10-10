import { useEffect, useState } from 'react';
import useTheme from './stores/useTheme';
import LayoutContent from './components/LayoutContent';
import LayoutHeader from './components/LayoutHeader';
// import LayoutFooter from './components/LayoutFooter';
import SlidingUpPanel from './components/SlideUpPanel';

const App = (): JSX.Element => {
  const [theme] = useTheme();
  const [isShownSlidingPanel, setIsShownSlidingPanel] = useState<boolean>(false);

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
      className="flex flex-col justify-center items-center h-[100vh] bg-base-100 text-base-content relative"
    >
      <LayoutHeader />
      <LayoutContent />
      {/* <LayoutFooter /> */}
      {/* Sliding content */}
      <button
        onClick={() => {
          setIsShownSlidingPanel(true);
        }}
      >
        Enable sliding panel
      </button>
      <SlidingUpPanel height={80} isEnabled={isShownSlidingPanel} setIsEnabled={setIsShownSlidingPanel}>
        <div>Hello this will work</div>
      </SlidingUpPanel>
    </div>
  );
};

export default App;
