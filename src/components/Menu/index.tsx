import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CgClose, CgTrash } from 'react-icons/cg';
import { VscDiscard } from 'react-icons/vsc';
import { AiOutlineSave, AiOutlineClockCircle } from 'react-icons/ai';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import { format } from 'date-fns';
import { Box, ClickAwayListener } from '@mui/material';
import structuredClone from '@ungap/structured-clone';
import {
  Text,
  Button,
  Input,
  ResizableInput,
  Select,
  DatePicker,
  TimePicker,
  DurationPicker,
  Tooltip,
} from 'components';
import { Program, ProgramRating, EPGValidator } from 'services/epg';
import SC from 'assets/icons/ratings/SC.svg';
import CL from 'assets/icons/ratings/RL.svg';
import C10 from 'assets/icons/ratings/R10.svg';
import C12 from 'assets/icons/ratings/R12.svg';
import C14 from 'assets/icons/ratings/R14.svg';
import C16 from 'assets/icons/ratings/R16.svg';
import C18 from 'assets/icons/ratings/R18.svg';
import { useModalProvider } from 'providers/ModalProvider';
import { IoIosAlert, IoIosInformationCircle } from 'react-icons/io';
import { RiAlertFill } from 'react-icons/ri';
import EntityMap from 'utils/entityMap';
import {
  EPGValidationMessages,
  EPGValidationMessageType,
} from 'services/epg/validator';
import {
  BottomContainer,
  ButtonContainer,
  ContentContainer,
  Form,
  FormColumn,
  FormContainer,
  FormRow,
  Icon,
  IconContainer,
  MenuContainer,
  SelectRateContainer,
  Toolbar,
  StyledInput,
  HelpContainer,
  ToolbarText,
  ActionButtons,
  MessageIconContainer,
  Message,
} from './styles';

const ratings = {
  RSC: SC,
  RL: CL,
  R10: C10,
  R12: C12,
  R14: C14,
  R16: C16,
  R18: C18,
};

export interface MenuProps {
  programs: EntityMap<Program>;
  hasChanges: boolean;
  tableWidth: number;
  selectedProgram: Program;
  setTableWidth: (val: number) => void;
  setSelectedProgramId: React.Dispatch<React.SetStateAction<Set<string>>>;
  setHasChanges: (val: boolean) => void;
  onSaveProgram: (val: Program) => void;
  handleRemoveProgram: (val: string) => void;
  setToggleClass: (val: boolean) => void;
}

const Menu: React.FC<MenuProps> = ({
  programs,
  hasChanges,
  tableWidth,
  selectedProgram,
  setTableWidth,
  setSelectedProgramId,
  setHasChanges,
  onSaveProgram,
  handleRemoveProgram,
  setToggleClass,
}) => {
  const { t } = useTranslation();

  const { openModal } = useModalProvider();
  const [newProgram, setNewProgram] = useState<Program>(
    selectedProgram ? structuredClone(selectedProgram) : new Program(),
  );
  const [openTime, setOpenTime] = useState(false);
  const [programMessages, setProgramMessages] = useState(
    {} as EPGValidationMessages,
  );

  useEffect(() => {
    setNewProgram(
      selectedProgram ? structuredClone(selectedProgram) : new Program(),
    );
  }, [selectedProgram]);

  useEffect(() => {
    const messages = EPGValidator.validate(programs.toArray());
    setProgramMessages(messages[selectedProgram.id] ?? {});
  }, [programs, selectedProgram.id]);

  return (
    <MenuContainer>
      <Toolbar>
        <ToolbarText>
          <p>{t('menu:edit')}:</p>
          <p>{selectedProgram?.title}</p>
        </ToolbarText>
        <ActionButtons display={hasChanges ? 'block' : 'none'}>
          <VscDiscard
            id="menu-button-discard"
            size="20px"
            onClick={() => {
              if (!selectedProgram) {
                return;
              }
              openModal({
                title: t('menu:discardProgramTitle'),
                content: t('menu:discardProgramMessage', {
                  programTitle: selectedProgram.title,
                }),
                confirm: () => {
                  setNewProgram(selectedProgram);
                  setHasChanges(false);
                },
              });
            }}
          />
          <CgTrash
            id="menu-button-remove"
            size="20px"
            onClick={() => {
              if (!selectedProgram) {
                return;
              }
              openModal({
                title: t('menu:deleteProgramTitle'),
                content: t('menu:deleteProgramMessage', {
                  programTitle: selectedProgram.title,
                }),
                confirm: () => {
                  handleRemoveProgram(selectedProgram.id);
                },
              });
            }}
          />
        </ActionButtons>
      </Toolbar>
      <ContentContainer>
        <BottomContainer>
          <FormContainer>
            <Form>
              <Text noSelect fontFamily="Nunito Bold" fontSize="32px">
                {t('menu:title')}
                {programMessages.ALL?.includes(
                  EPGValidationMessageType.EMPTY_TITLE,
                ) && (
                  <Tooltip
                    arrow
                    title={
                      <Message>{t('messages:message_EMPTY_TITLE')}</Message>
                    }
                  >
                    <MessageIconContainer>
                      &nbsp;
                      <IoIosAlert size="16px" color="var(--color-system-1)" />
                    </MessageIconContainer>
                  </Tooltip>
                )}
              </Text>
              <Input
                height="45px"
                value={newProgram?.title}
                setValue={title => {
                  setNewProgram(p => ({ ...p, title }));
                  setHasChanges(true);
                }}
                onCtrlEnter={() => onSaveProgram(newProgram)}
              />
              <Text noSelect fontFamily="Nunito Bold" fontSize="32px">
                {t('menu:description')}
                {programMessages.ALL?.includes(
                  EPGValidationMessageType.EMPTY_DESCRIPTION,
                ) && (
                  <Tooltip
                    arrow
                    title={
                      <Message>
                        {t('messages:message_EMPTY_DESCRIPTION')}
                      </Message>
                    }
                  >
                    <MessageIconContainer>
                      &nbsp;
                      <IoIosAlert size="16px" color="var(--color-system-1)" />
                    </MessageIconContainer>
                  </Tooltip>
                )}
              </Text>
              <ResizableInput
                value={newProgram?.description}
                setValue={description => {
                  setNewProgram(p => ({ ...p, description }));
                  setHasChanges(true);
                }}
                onCtrlEnter={() => onSaveProgram(newProgram)}
              />
              <Text noSelect fontFamily="Nunito Bold" fontSize="32px">
                {t('menu:parentalRating')}
                {programMessages.ALL?.includes(
                  EPGValidationMessageType.NO_PARENTAL_RATING,
                ) && (
                  <MessageIconContainer>
                    <Tooltip
                      arrow
                      title={
                        <Message>
                          {t('messages:message_NO_PARENTAL_RATING')}
                        </Message>
                      }
                    >
                      <MessageIconContainer>
                        &nbsp;
                        <RiAlertFill
                          size="16px"
                          color="var(--color-system-2)"
                        />
                      </MessageIconContainer>
                    </Tooltip>
                  </MessageIconContainer>
                )}
              </Text>
              <SelectRateContainer>
                <Select
                  value={newProgram?.rating.toString() ?? ProgramRating.RL}
                  setValue={rating => {
                    setNewProgram(p => ({
                      ...p,
                      rating: rating as ProgramRating,
                    }));
                    setHasChanges(true);
                  }}
                  options={Object.values(ProgramRating).map(r => ({
                    label: t(`parental-guidance:rating_${r}`),
                    value: r.toString(),
                  }))}
                />
                <IconContainer>
                  <Icon
                    src={
                      ratings[newProgram?.rating.toString() ?? ProgramRating.RL]
                    }
                    alt="Rate Icon"
                  />
                </IconContainer>
              </SelectRateContainer>
              <FormRow>
                <FormColumn>
                  <Text noSelect fontFamily="Nunito Bold" fontSize="32px">
                    {t('menu:startDate')}
                    {programMessages.ALL?.includes(
                      EPGValidationMessageType.PAST_START_DATE,
                    ) && (
                      <MessageIconContainer>
                        <Tooltip
                          arrow
                          title={
                            <Message>
                              {t('messages:message_PAST_START_DATE')}
                            </Message>
                          }
                        >
                          <MessageIconContainer>
                            &nbsp;
                            <RiAlertFill
                              size="16px"
                              color="var(--color-system-2)"
                            />
                          </MessageIconContainer>
                        </Tooltip>
                      </MessageIconContainer>
                    )}
                    {programMessages.ALL?.includes(
                      EPGValidationMessageType.FAR_START_DATE,
                    ) && (
                      <MessageIconContainer>
                        <Tooltip
                          arrow
                          title={
                            <Message color="var(--color-neutral-3)">
                              {t('messages:message_FAR_START_DATE')}
                            </Message>
                          }
                        >
                          <MessageIconContainer>
                            &nbsp;
                            <IoIosInformationCircle
                              size="16px"
                              color="var(--color-neutral-3)"
                            />
                          </MessageIconContainer>
                        </Tooltip>
                      </MessageIconContainer>
                    )}
                  </Text>
                  <DatePicker
                    date={newProgram?.startDateTime ?? new Date()}
                    onDateChange={startDate => {
                      setNewProgram(p => {
                        const { startDateTime } = p;
                        startDateTime.setDate(startDate.getDate());
                        startDateTime.setMonth(startDate.getMonth());
                        startDateTime.setFullYear(startDate.getFullYear());
                        return { ...p, startDateTime };
                      });
                      setHasChanges(true);
                    }}
                  />
                </FormColumn>
                <FormColumn>
                  <Text noSelect fontFamily="Nunito Bold" fontSize="32px">
                    {t('menu:startTime')}
                    {programMessages.ALL?.includes(
                      EPGValidationMessageType.TIME_GAP,
                    ) && (
                      <MessageIconContainer>
                        <Tooltip
                          arrow
                          title={
                            <Message>{t('messages:message_TIME_GAP')}</Message>
                          }
                        >
                          <MessageIconContainer>
                            &nbsp;
                            <IoIosAlert
                              size="16px"
                              color="var(--color-system-1)"
                            />
                          </MessageIconContainer>
                        </Tooltip>
                      </MessageIconContainer>
                    )}
                  </Text>
                  <ClickAwayListener
                    mouseEvent="onMouseDown"
                    touchEvent="onTouchStart"
                    onClickAway={() => setOpenTime(false)}
                  >
                    <Box>
                      <HelpContainer>
                        <StyledInput variant="outlined">
                          <OutlinedInput
                            className="epg-time"
                            value={format(
                              newProgram?.startDateTime,
                              'HH:mm:ss',
                            )}
                            endAdornment={
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setOpenTime(prev => !prev)}
                                  aria-label="toggle password visibility"
                                  edge="end"
                                >
                                  <AiOutlineClockCircle />
                                </IconButton>
                              </InputAdornment>
                            }
                          />
                        </StyledInput>
                      </HelpContainer>
                      {openTime ? (
                        <TimePicker
                          time={newProgram?.startDateTime ?? new Date()}
                          onTimeChange={startTime => {
                            setNewProgram(p => {
                              const { startDateTime } = p;
                              startDateTime.setHours(startTime.getHours());
                              startDateTime.setMinutes(startTime.getMinutes());
                              startDateTime.setSeconds(startTime.getSeconds());
                              return { ...p, startDateTime };
                            });
                            setHasChanges(true);
                          }}
                        />
                      ) : null}
                    </Box>
                  </ClickAwayListener>
                </FormColumn>
              </FormRow>
              <FormRow>
                <FormColumn>
                  <Text noSelect fontFamily="Nunito Bold" fontSize="32px">
                    {t('menu:duration')}
                    {programMessages.ALL?.includes(
                      EPGValidationMessageType.INVALID_DURATION,
                    ) && (
                      <MessageIconContainer>
                        <Tooltip
                          arrow
                          title={
                            <Message>
                              {t('messages:message_INVALID_DURATION')}
                            </Message>
                          }
                        >
                          <MessageIconContainer>
                            &nbsp;
                            <IoIosAlert
                              size="16px"
                              color="var(--color-system-1)"
                            />
                          </MessageIconContainer>
                        </Tooltip>
                      </MessageIconContainer>
                    )}
                  </Text>
                  <DurationPicker
                    duration={newProgram?.duration ?? 0}
                    // eslint-disable-next-line no-shadow
                    onSubmit={duration => {
                      setNewProgram(p => ({ ...p, duration }));
                      setHasChanges(true);
                    }}
                  />
                </FormColumn>
                <FormColumn />
              </FormRow>
            </Form>
            <ButtonContainer>
              <Button
                text={t('menu:cancel')}
                icon={<CgClose />}
                onClick={() => {
                  setSelectedProgramId(new Set());
                  setHasChanges(false);
                  setTableWidth(tableWidth + 540);
                  setToggleClass(false);
                }}
              />
              <Button
                text={t('menu:save')}
                icon={<AiOutlineSave />}
                onClick={() => {
                  if (newProgram) {
                    onSaveProgram(newProgram);
                  }
                }}
              />
            </ButtonContainer>
          </FormContainer>
        </BottomContainer>
      </ContentContainer>
    </MenuContainer>
  );
};
export default Menu;
