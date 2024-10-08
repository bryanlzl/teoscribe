import { MicrophoneIcon } from '@heroicons/react/24/solid';

const ButtonCircularRecord = () => {
  return (
    <div className="flex flex-col justify-center items-center space-y-[1.5rem] w-fit h-[100%]">
      <h2 className="text-center opacity-75">Tap to speak</h2>
      <button className="btn btn-circle w-[15.5rem] h-[15.5rem] bg-primary">
        <MicrophoneIcon className={'text-accent w-[50%] h-auto'} />
      </button>
    </div>
  );
};

export default ButtonCircularRecord;
