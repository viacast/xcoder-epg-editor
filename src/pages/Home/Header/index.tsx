import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CgPlayListAdd, CgPlayListRemove } from 'react-icons/cg';
import {
  FaDownload,
  FaFileCode,
  FaFileCsv,
  FaFileExport,
} from 'react-icons/fa';
import FileSaver from 'file-saver';

import { EPGParser, Program } from 'services/epg';
import { Button, FileInput, FileInputRefProps } from 'components';
import EPGBuilder from 'services/epg/builder';
import { LocalStorageKeys, useClickOutside, useLocalStorage } from 'hooks';
import { EntityMap } from 'utils';
import { format } from 'date-fns';
import { toast, TypeOptions } from 'react-toastify';
import types from '@emotion/styled';
import { useModalProvider } from 'providers/ModalProvider';
import {
  HeaderContainer,
  MenuOptions,
  ExportOptions,
  Select,
  Text,
} from './styles';

export interface HeaderProps {
  programs: EntityMap<Program>;
  setPrograms: (programs: Program[]) => void;
  handleAddProgram: () => void;
  handleClearProgramList: () => void;
  setIsClosing: (value: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({
  programs,
  setPrograms,
  handleAddProgram,
  handleClearProgramList,
  setIsClosing,
}) => {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [programCount, setProgramCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [savedFilename, setSavedFilename] = useLocalStorage(
    LocalStorageKeys.CURRENT_FILENAME,
    '',
  );
  const [epgFilename, setEpgFilename] = useState(savedFilename || '');

  const fileInputRef = useRef<FileInputRefProps>({});
  const exportOptionsRef = useRef<HTMLDivElement>(null);

  const { openModal } = useModalProvider();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const addNotification = () => {
    toast(t('header:alert'), {
      type: types[Math.floor(Math.random() * types.length)] as TypeOptions,
    });
  };

  useEffect(() => {
    setProgramCount(programs.count);
  }, [programs.count]);

  const handleChange = useCallback(
    evt => {
      const { value } = evt.target;
      setCurrentLanguage(value);
      i18n.changeLanguage(value);
    },
    [i18n],
  );

  const handleFileUpload = useCallback(
    async files => {
      if (!files.length) {
        return;
      }
      if (files[0].type !== 'text/xml' && files[0].type !== 'text/csv') {
        addNotification();
      }
      const newPrograms = await EPGParser.parseFile(files[0]);
      if (epgFilename === '') {
        setPrograms(newPrograms);
        setEpgFilename(files[0].name);
        setSavedFilename(files[0].name);
      } else if (epgFilename !== '') {
        openModal({
          title: t('header:titleOverwrite'),
          content: t('header:overwrite'),
          confirm: () => {
            setPrograms(newPrograms);
            setEpgFilename(files[0].name);
            setSavedFilename(files[0].name);
          },
        });
      }
    },
    [addNotification, epgFilename, openModal, setPrograms, setSavedFilename, t],
  );

  useClickOutside(exportOptionsRef, () => setOpen(false));

  return (
    <HeaderContainer className="no-user-select">
      <FileInput
        className="epg-input"
        forwardRef={fileInputRef}
        disabled
        placeholder={
          epgFilename !== '' ? epgFilename : t('header:placeholderInput')
        }
        onFileUpload={handleFileUpload}
      />
      <Button
        text={t('header:buttonImportProgram')}
        icon={<FaDownload />}
        onClick={() => {
          fileInputRef?.current.click?.();
        }}
      />
      <MenuOptions>
        <Button
          text={t('header:buttonExportProgram')}
          icon={<FaFileExport />}
          onClick={() => setOpen(!open)}
        />
        <ExportOptions
          ref={exportOptionsRef}
          display={!open ? 'none' : 'block'}
        >
          <Button
            text="XML"
            icon={<FaFileCode />}
            onClick={() => {
              const blob = new Blob([EPGBuilder.buildXml(programs.toArray())], {
                type: 'application/xml',
              });
              FileSaver.saveAs(
                blob,
                `EPG_${format(new Date(), 'yyyyMMdd_HHmmss')}.xml`,
              );
            }}
          />
          <Button
            text="CSV"
            icon={<FaFileCsv />}
            onClick={() => {
              const blob = new Blob([EPGBuilder.buildCsv(programs.toArray())], {
                type: 'text/csv',
              });
              FileSaver.saveAs(
                blob,
                `EPG_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`,
              );
            }}
          />
        </ExportOptions>
      </MenuOptions>
      <Button
        text={t('header:buttonAddProgram')}
        icon={<CgPlayListAdd />}
        onClick={handleAddProgram}
      />
      <Button
        text={t('header:buttonClearProgramList')}
        icon={<CgPlayListRemove />}
        onClick={() => {
          if (epgFilename !== '') {
            openModal({
              title: t('header:buttonClearProgramList'),
              content: t('header:clear'),
              confirm: () => {
                setEpgFilename('');
                setSavedFilename('');
                handleClearProgramList();
                fileInputRef.current.clearFiles?.();
                setIsClosing(true);
              },
            });
          }
        }}
      />
      <Text>
        {t('header:labelProgram', {
          count: programCount,
        })}
      </Text>
      <Select onChange={handleChange} value={currentLanguage}>
        <option value="pt">Portugues</option>
        <option value="en">English</option>
      </Select>
    </HeaderContainer>
  );
};

export default Header;
