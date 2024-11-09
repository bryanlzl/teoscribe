import { ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import useLangConversion from '../stores/useLangConversion';
import ToggleTheme from './ToggleTheme';

const LayoutHeader = (): JSX.Element => {
    const { conversionSettings, setConversionSettings } = useLangConversion();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => {
        setIsOpen((prev) => !prev);
    };

    const handleDropdownOptionClick = (model: string) => {
        handleSetTranscriptionModel(model);
        setIsOpen(false);
    };

    const handleSetTranscriptionModel = (inputModel: string): void => {
        setConversionSettings({
            ...conversionSettings,
            model: inputModel,
        });
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="flex flex-row justify-between self-start w-[100vw] h-[4.5rem]">
            <span className="my-[1rem] mx-[1.5rem] rounded-md h-fit">
                <h1 className="text-xl font-semibold h-fit">TeoSCRIBE</h1>
                <span className="flex flex-row justify-start text-xs mb-[0.5rem]">
                    <p className="underline">The </p>&nbsp;
                    <p>app for Teochew learning!</p>
                </span>
                <div className="dropdown dropdown-bottom mt-1" ref={dropdownRef}>
                    <div
                        tabIndex={0}
                        role="button"
                        onClick={toggleDropdown}
                        className={`btn m-1 flex flex-row justify-start text-xs m-0 p-0 ${
                            isOpen ? 'bg-secondary' : 'bg-transparent'
                        } shadow-none`}
                        style={{ padding: '0.2rem 0.5rem', margin: '0', height: '1.2rem' }}
                    >
                        <p>Model:</p>
                        <p>
                            {conversionSettings.model.charAt(0).toUpperCase() +
                                conversionSettings.model.slice(1).toLowerCase()}
                        </p>
                        <ArrowsUpDownIcon className="w-[1.2rem]" />
                    </div>
                    {isOpen && (
                        <ul
                            tabIndex={0}
                            className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 m-0 p-0 bg-secondary rounded-lg"
                            style={{ marginTop: '0.1rem' }}
                        >
                            <li onClick={() => handleDropdownOptionClick('standard')}>
                                <a>Standard</a>
                            </li>
                            <li onClick={() => handleDropdownOptionClick('semantics')}>
                                <a>Semantics</a>
                            </li>
                        </ul>
                    )}
                </div>
            </span>
            <ToggleTheme />
        </div>
    );
};

export default LayoutHeader;
