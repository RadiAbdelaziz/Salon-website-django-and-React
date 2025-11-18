/**
 * Date and Time Selection Component
 * Handles date and time selection in the booking flow
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';

const DateTimeSelection = ({ 
  selectedDate, 
  selectedTime, 
  timeSlots, 
  onDateSelect, 
  onTimeSelect 
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--warm-brown)' }}>
          اختيار التاريخ والوقت
        </h3>
        <p className="text-sm" style={{ color: 'var(--medium-beige)' }}>
          اختاري التاريخ والوقت المناسب لك
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar */}
        <div>
          <h4 className="font-semibold mb-4" style={{ color: 'var(--warm-brown)' }}>
            اختر التاريخ
          </h4>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
            <DateCalendar
              value={selectedDate}
              onChange={onDateSelect}
              minDate={dayjs()}
              maxDate={dayjs().add(30, 'day')}
              sx={{
                '& .MuiPickersCalendarHeader-root': {
                  color: 'var(--warm-brown)',
                },
                '& .MuiDayCalendar-weekDayLabel': {
                  color: 'var(--medium-beige)',
                },
                '& .MuiPickersDay-root': {
                  color: 'var(--warm-brown)',
                },
                '& .MuiPickersDay-root.Mui-selected': {
                  backgroundColor: 'var(--glamour-gold)',
                  color: 'white',
                },
              }}
            />
          </LocalizationProvider>
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--warm-brown)' }}>
              اختر الوقت
            </h4>
            <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  size="sm"
                  onClick={() => onTimeSelect(time)}
                  className="py-2"
                  style={{
                    background: selectedTime === time ? 'var(--glamour-gold)' : 'transparent',
                    color: selectedTime === time ? 'white' : 'var(--warm-brown)',
                    borderColor: 'var(--silken-dune)'
                  }}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateTimeSelection;
