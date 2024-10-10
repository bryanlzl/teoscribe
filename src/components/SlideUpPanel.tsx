import React, { FC, Dispatch, SetStateAction } from 'react';

interface ISlidingUpPanelProps {
  children: React.ReactNode;
  height: number;
  isEnabled: boolean;
  setIsEnabled: Dispatch<SetStateAction<boolean>>;
}

const SlidingUpPanel: FC<ISlidingUpPanelProps> = ({ children, height, isEnabled, setIsEnabled }) => {
  return (
    <div
      className={`absolute bottom-0 transition-max-height duration-500 ease-in-out overflow-hidden w-full bg-gray-700 text-center ${
        isEnabled ? `h-[${height}vh] py-4` : 'h-0'
      }`}
    >
      <div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setIsEnabled(false);
          }}
        >
          close panel
        </button>
        {children}
      </div>
    </div>
  );
};

export default SlidingUpPanel;
