import { useEffect } from 'react';
import ToggleTheme from './components/toggleTheme';
import useTheme from './stores/useTheme';

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
    <div data-theme={theme} className="flex flex-col justify-center items-center bg-base-100 text-base-content">
      <div className="flex flex-row justify-between self-start w-[100vw] h-[100vh]">
        <span className="my-[1rem] mx-[1.5rem] rounded-md h-fit">
          <h1 className="text-xl h-fit font-semibold">Dialectal</h1>
          <span className="flex flex-row justify-start text-xs">
            <p className="underline">The </p>&nbsp;
            <p>app for dialect learning!</p>
          </span>
        </span>
        <ToggleTheme />
      </div>
    </div>
  );
};

export default App;
