import SelectLangConversion from './SelectLangConversion';
import ButtonCircularRecord from './ButtonCircularRecord';

const LayoutContent = (): JSX.Element => {
  return (
    <div className="flex flex-col justify-center items-center w-[100%] h-[100%]">
      <SelectLangConversion />
      <ButtonCircularRecord />
    </div>
  );
};

export default LayoutContent;
