import ToggleTheme from './toggleTheme';

const LayoutHeader = (): JSX.Element => {
  return (
    <div className="flex flex-row justify-between self-start w-[100vw] h-[4.5rem]">
      <span className="my-[1rem] mx-[1.5rem] rounded-md h-fit">
        <h1 className="text-xl h-fit font-semibold">Dialectal</h1>
        <span className="flex flex-row justify-start text-xs">
          <p className="underline">The </p>&nbsp;
          <p>app for dialect learning!</p>
        </span>
      </span>
      <ToggleTheme />
    </div>
  );
};

export default LayoutHeader;
