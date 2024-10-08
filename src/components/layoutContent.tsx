import ButtonCircularRecord from './buttonCircularRecord';
import SelectConversion from './selectLangConversion';

const LayoutContent = (): JSX.Element => {
  return (
    <div className="flex flex-col justify-between items-center w-[100%] h-[100%]">
      <SelectConversion />
      <ButtonCircularRecord />
      <h3 className="mx-[1.5rem] mb-[2rem]">*Footer*</h3>
    </div>
  );
};

export default LayoutContent;
