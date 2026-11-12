import React from 'react';
import { HoroscopeCalculationResult } from '../services/astrologyEngine.ts';

interface SouthIndianChartProps {
  calculation: HoroscopeCalculationResult;
}

export const SouthIndianChart: React.FC<SouthIndianChartProps> = ({ calculation }) => {
  // Mapping of grid positions (row 0-3, col 0-3) to Sign Index (0 = Aries, 11 = Pisces)
  // Row 0: Pisces (11), Aries (0), Taurus (1), Gemini (2)
  // Row 1: Aquarius (10), [Center], [Center], Cancer (3)
  // Row 2: Capricorn (9), [Center], [Center], Leo (4)
  // Row 3: Sagittarius (8), Scorpio (7), Libra (6), Virgo (5)
  const gridSigns: { [key: string]: { signIndex: number; name: string } } = {
    '0,0': { signIndex: 11, name: 'Pisces' },
    '0,1': { signIndex: 0, name: 'Aries' },
    '0,2': { signIndex: 1, name: 'Taurus' },
    '0,3': { signIndex: 2, name: 'Gemini' },

    '1,0': { signIndex: 10, name: 'Aquarius' },
    '1,3': { signIndex: 3, name: 'Cancer' },

    '2,0': { signIndex: 9, name: 'Capricorn' },
    '2,3': { signIndex: 4, name: 'Leo' },

    '3,0': { signIndex: 8, name: 'Sagittarius' },
    '3,1': { signIndex: 7, name: 'Scorpio' },
    '3,2': { signIndex: 6, name: 'Libra' },
    '3,3': { signIndex: 5, name: 'Virgo' },
  };

  const ascSignIndex = calculation.ascendant.signIndex;

  const renderCell = (row: number, col: number) => {
    const key = `${row},${col}`;

    // Center 2x2 area
    if ((row === 1 || row === 2) && (col === 1 || col === 2)) {
      if (row === 1 && col === 1) {
        return (
          <div
            key={key}
            className="col-span-2 row-span-2 bg-white flex flex-col items-center justify-center border border-slate-300 p-4 text-center select-none"
          >
            <div className="font-serif-vedic text-sm sm:text-base font-bold text-slate-800 tracking-wider">
              VISHAKHA_ASTRA
            </div>
            <div className="text-[11px] text-amber-700 font-medium tracking-wide mt-1">
              South Indian Rasi Chart
            </div>
            <div className="mt-2 text-[10px] text-slate-500 max-w-[140px]">
              Fixed Zodiac Signs • Ascendant (Asc) & Planetary Alignments
            </div>
          </div>
        );
      }
      return null; // Handled by col-span-2 row-span-2
    }

    const cellData = gridSigns[key];
    if (!cellData) return null;

    const planetsInSign = calculation.signs[cellData.signIndex] || [];
    const isAscendantSign = ascSignIndex === cellData.signIndex;

    return (
      <div
        key={key}
        className={`relative border border-slate-300 bg-white p-2 min-h-[90px] sm:min-h-[110px] flex flex-col justify-between transition-all hover:bg-slate-50 ${
          isAscendantSign ? 'ring-2 ring-inset ring-amber-500/40 bg-amber-50/20' : ''
        }`}
      >
        {/* Cell Header: Sign Name & Ascendant Flag */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-1">
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600 truncate">
            {cellData.name}
          </span>
          {isAscendantSign && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
              Asc
            </span>
          )}
        </div>

        {/* Planets Inside this Sign */}
        <div className="flex flex-wrap gap-1 mt-1 content-start flex-1">
          {planetsInSign
            .filter((p) => p.name !== 'Ascendant')
            .map((p) => (
              <span
                key={p.name}
                title={`${p.name} (${p.degreeFormatted || p.degreeInSign.toFixed(1) + '°'})`}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-800 border border-slate-200"
              >
                {p.symbol}
                <span className="text-[8px] text-slate-500 ml-0.5 font-mono">
                  {Math.floor(p.degreeInSign)}°{Math.floor((p.degreeInSign % 1) * 60)}&apos;
                </span>
              </span>
            ))}
          {planetsInSign.filter((p) => p.name !== 'Ascendant').length === 0 && (
            <span className="text-[10px] text-slate-300 italic">—</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-xl border border-slate-300 p-3 sm:p-4 shadow-sm">
      <div className="grid grid-cols-4 grid-rows-4 gap-0 border-2 border-slate-400 bg-slate-200">
        {Array.from({ length: 4 }).map((_, row) =>
          Array.from({ length: 4 }).map((_, col) => renderCell(row, col))
        )}
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 px-1">
        <span>* Asc indicates Rising Sign (Lagna)</span>
        <span>Standard Clockwise Sidereal Matrix</span>
      </div>
    </div>
  );
};
