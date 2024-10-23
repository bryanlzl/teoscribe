import React, { FC, Dispatch, SetStateAction, useState } from 'react';
import { ArrowDownIcon } from '@heroicons/react/24/outline';
import useAppViewState from '../stores/useAppViewState';

interface ISlidingUpPanelProps {
  children: React.ReactNode;
  component: string;
  stackedText: string;
  isStacked: boolean;
  offsetHeight: number;
  isEnabled: boolean;
  setIsEnabled: Dispatch<SetStateAction<boolean>>;
}

const SlidingUpPanel: FC<ISlidingUpPanelProps> = ({
  children,
  component,
  stackedText,
  isStacked,
  offsetHeight,
  isEnabled,
}) => {
  const { appViewState, setAppViewState } = useAppViewState();

  const [chevronIconRotate, setChevronIconRotate] = useState<string>('rotate-0');
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const undoStackedTitle = (componentName: string): void => {
    if (componentName === 'playbackPanel') {
      setAppViewState({
        ...appViewState,
        panels: {
          ...appViewState.panels,
          resultPanel: { ...appViewState.panels.resultPanel, isStacked: false },
          playbackPanel: { ...appViewState.panels.resultPanel, isOpen: false, isStacked: false },
        },
      });
    } else {
      setAppViewState({
        ...appViewState,
        panels: {
          ...appViewState.panels,
          resultPanel: { ...appViewState.panels.resultPanel, isStacked: false, isOpen: false },
        },
      });
    }
  };

  return (
    <div
      style={{
        height: isEnabled ? `calc(100vh - ${offsetHeight}rem)` : '0',
        boxShadow: '0 -0.5rem 1rem rgba(0, 0, 0, 0.15)',
      }}
      className="absolute bottom-0 w-full bg-secondary text-center transition-all duration-500 ease-in-out overflow-hidden"
    >
      {isStacked ? (
        <p className="h-[3rem] mb-[2rem] font-bold opacity-50 flex items-center justify-center self-center">
          {stackedText}
        </p>
      ) : (
        <button
          className="btn btn-xs w-[100%] h-[2.5rem] bg-secondary hover:bg-transparent border-none shadow-none no-animation rounded-none"
          onClick={() => {
            undoStackedTitle(component);
          }}
          onMouseEnter={() => {
            setChevronIconRotate('rotate-0');
            setIsHovered(true);
          }}
          onMouseLeave={() => {
            setChevronIconRotate('rotate-180');
            setIsHovered(false);
          }}
        >
          <ArrowDownIcon
            className={`h-[1.2rem] transition-transform duration-500 ${
              isHovered ? 'animate-float-up-down' : ''
            } ${chevronIconRotate}`}
          />
        </button>
      )}

      <div
        className={`${!isEnabled ? 'hidden' : ''} transition-opacity duration-500 ${
          isHovered ? 'opacity-50' : 'opacity-100'
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default SlidingUpPanel;
