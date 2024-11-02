import { useEffect } from 'react';
import LayoutContent from './components/LayoutContent';
import LayoutHeader from './components/LayoutHeader';
import useTheme from './stores/useTheme';
// import LayoutFooter from './components/LayoutFooter';
import PlaybackPanel from './components/PlaybackPanel';
import ResultPanel from './components/ResultPanel';

const App = (): JSX.Element => {
    const { theme } = useTheme();

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
            className="relative flex flex-col justify-center items-center h-[100vh] bg-base-100 text-base-content"
        >
            <LayoutHeader />
            <LayoutContent />
            {/* <LayoutFooter /> */}

            {/* Sliding content */}
            <ResultPanel />
            <PlaybackPanel />
        </div>
    );
};

export default App;
