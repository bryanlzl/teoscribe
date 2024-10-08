import { ChangeEvent } from 'react';
import { LanguageIcon, MicrophoneIcon } from '@heroicons/react/24/outline';
import { TRANSLATION_LIBRARY } from '../definitions/conversionDict';
import useLangConversion from '../stores/useLangConversion';

const SelectLangConversion = (): JSX.Element => {
  const [conversionSettings, setConversionSettings] = useLangConversion();

  const handleTargetLangSelection = (event: ChangeEvent<HTMLSelectElement>): void => {
    setConversionSettings({ ...conversionSettings, targetLanguage: event.target.value });
  };

  const handleSourceLangSelection = (event: ChangeEvent<HTMLSelectElement>): void => {
    setConversionSettings({ ...conversionSettings, sourceLanguage: event.target.value, targetLanguage: '' });
  };

  return (
    <div className="flex flex-col space-y-[1rem] mt-[5vh]">
      {/* Source Language Selection */}
      <span className="flex flex-row space-x-[0.75rem] items-center">
        <MicrophoneIcon className="h-[1.2rem] w-auto text-base-content" />
        <select
          className="select select-md text-[0.9rem] w-[14rem] bg-secondary"
          onChange={handleSourceLangSelection}
          value={conversionSettings.sourceLanguage || ''}
          disabled={true}
        >
          <option value="" disabled>
            Select Source Language
          </option>
          {Object.keys(TRANSLATION_LIBRARY).map((sourceLanguage: string, index: number) => (
            <option key={index} className="text-[0.85rem]" value={sourceLanguage}>
              {sourceLanguage}
            </option>
          ))}
        </select>
      </span>
      {/* Target Language Selection */}
      <span className="flex flex-row space-x-[0.75rem] items-center">
        <LanguageIcon className="h-[1.2rem] w-auto text-base-content" />
        <select
          className="select select-md text-[0.9rem] w-[14rem] bg-secondary"
          onChange={handleTargetLangSelection}
          value={conversionSettings.targetLanguage || ''}
          disabled={true}
          // disabled={!conversionSettings.sourceLanguage}
        >
          <option value="" disabled>
            Select Target Language
          </option>
          {conversionSettings.sourceLanguage &&
            Object.keys(TRANSLATION_LIBRARY[conversionSettings.sourceLanguage]).map(
              (targetLanguage: string, index: number) => (
                <option key={index} className="text-[0.85rem]" value={targetLanguage}>
                  {targetLanguage}
                </option>
              ),
            )}
        </select>
      </span>
    </div>
  );
};

export default SelectLangConversion;
