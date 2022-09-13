import React, { useCallback, useEffect, useState } from 'react';

import { Menu, VTable } from 'components';
import { Program } from 'services/epg';
import { addToDate, EntityMap } from 'utils';

import { LocalStorageKeys, useLocalStorage, useWindowSize } from 'hooks';
import {
  Container,
  HeaderContainer,
  MenuContainer,
  TableContainer,
  TableMenuContainer,
} from './styles';
import Header from './Header';

const Home: React.FC = () => {
  const [selectedProgramId, setSelectedProgramId] = useState<Set<string>>(
    new Set(),
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [savedPrograms, setSavedPrograms] = useLocalStorage(
    LocalStorageKeys.CURRENT_PROGRAMS,
    [] as Program[],
  );
  const [programs, setPrograms] = useState(
    new EntityMap<Program>(savedPrograms?.map(p => new Program(p))),
  );

  const [selectedProgram, setSelectedProgram] = useState(
    programs.get(Array.from(selectedProgramId)[0]),
  );

  useEffect(() => {
    if (programs.toArray().length !== 0) {
      setSavedPrograms(programs.toArray());
    }
  }, [programs, setSavedPrograms]);

  const dimension = useWindowSize();

  const heightVariance = (val: number) => {
    // y = x * 1.042 – 205.35
    return Math.ceil(1.042 * val - 205.35);
  };

  const [width, setWidth] = useState(dimension.width - 60);
  const [height, setHeight] = useState(heightVariance(dimension.height));

  useEffect(() => {
    const measure = heightVariance(dimension.height);
    if (measure > 831) {
      setHeight(831);
    } else if (measure < 430) {
      setHeight(430);
    } else {
      setHeight(measure);
    }
  }, [setHeight, dimension]);

  const [toggleClass, setToggleClass] = useState(false);

  useEffect(() => {
    if (toggleClass === false) {
      if (dimension.width - 60 <= 1350) {
        setWidth(1350);
      } else {
        setWidth(dimension.width - 60);
      }
    }
    if (toggleClass === true) {
      if (dimension.width - 600 <= 815) {
        setWidth(815);
      } else {
        setWidth(dimension.width - 600);
      }
    }
  }, [setWidth, dimension, toggleClass]);

  const handleAddProgram = useCallback(() => {
    let startDateTime = new Date();
    if (programs.count) {
      const programList = programs.toArray();
      const lastProgram = programList[programList.length - 1];
      startDateTime = addToDate(
        lastProgram.startDateTime,
        lastProgram.duration,
      );
    }
    const addedProgram = new Program({
      duration: 3600,
      startDateTime,
    });
    setPrograms(p => p.add(addedProgram).clone());
    setTimeout(() => {
      setSelectedProgramId(p => p.add(addedProgram.id));
      if (dimension.width - 600 <= 815) {
        setWidth(815);
      } else {
        setWidth(dimension.width - 600);
      }
      const objDiv = document.getElementsByClassName(
        'ReactVirtualized__Grid',
      )[0];
      if (objDiv) {
        objDiv.scrollTop = objDiv.scrollHeight;
      }
    }, 100);
  }, [dimension.width, programs]);

  const handleClearProgramList = useCallback(() => {
    setSelectedProgramId(new Set());
    setPrograms(new EntityMap<Program>());
    setSavedPrograms([] as Program[]);
  }, [setSavedPrograms]);

  return (
    <Container>
      <HeaderContainer>
        <Header
          width={width}
          setWidth={setWidth}
          programs={programs}
          selectedProgramId={selectedProgramId}
          setNewPrograms={newPrograms => {
            setSelectedProgramId(new Set());
            setToggleClass(false);
            setSavedPrograms(newPrograms.toArray());
            setPrograms(newPrograms);
          }}
          handleAddProgram={handleAddProgram}
          handleClearProgramList={handleClearProgramList}
        />
      </HeaderContainer>
      <TableMenuContainer>
        <TableContainer
          className="epg-table-menu-content"
          width={selectedProgramId.size !== 1 ? '100%' : 'calc(100% - 535px)'}
        >
          <VTable
            selectedProgramId={selectedProgramId}
            setSelectedProgramId={setSelectedProgramId}
            setPrograms={setPrograms}
            programs={programs}
            toggleClass={toggleClass}
            setToggleClass={setToggleClass}
            width={width}
            setWidth={setWidth}
            height={height}
            setSelectedProgram={setSelectedProgram}
          />
        </TableContainer>
        <MenuContainer
          className="epg-table-menu-content"
          width={selectedProgramId.size !== 1 ? '0px' : '500px'}
          tp={toggleClass ? 'width' : 'none'}
        >
          <Menu
            width={width}
            setWidth={setWidth}
            programs={programs}
            hasChanges={hasChanges}
            setHasChanges={setHasChanges}
            setSelectedProgramId={setSelectedProgramId}
            onSaveProgram={program => {
              setPrograms(p => p.update(program).clone());
              setHasChanges(false);
            }}
            selectedProgram={selectedProgram ?? new Program()}
            handleRemoveProgram={programId => {
              setPrograms(p => {
                const size = p.toArray().length;
                const index = p.indexOf(programId);
                const idList: Set<string> = new Set();
                if (size === 1) {
                  // was the only program on the list
                  setSelectedProgramId(new Set());
                  setSelectedProgram(new Program());
                } else if (index === size - 1) {
                  // was the last program on the list
                  idList.add(p.at(index - 1)?.id ?? '');
                  setSelectedProgramId(idList);
                  setSelectedProgram(programs.get(Array.from(idList)[0]));
                } else {
                  // all other cases
                  idList.add(p.at(index + 1)?.id ?? '');
                  setSelectedProgramId(idList);
                  setSelectedProgram(programs.get(Array.from(idList)[0]));
                }
                return p.remove(programId).clone();
              });
            }}
            setToggleClass={setToggleClass}
          />
        </MenuContainer>
      </TableMenuContainer>
    </Container>
  );
};

export default Home;
