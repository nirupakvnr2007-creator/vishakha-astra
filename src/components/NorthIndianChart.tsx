import React from 'react';
import { HoroscopeCalculationResult } from '../services/astrologyEngine.ts';

interface NorthIndianChartProps {
  calculation: HoroscopeCalculationResult;
}

export const NorthIndianChart: React.FC<NorthIndianChartProps> = ({ calculation }) => {
  const ascSignIndex = calculation.ascendant.signIndex;

  // Center coordinates for label & planets in each of the 12 fixed houses
  const housePositions: { [house: number]: { x: number; y: number; labelY: number } } = {
    1: { x: 200, y: 110, labelY: 70 }, // Top Diamond (Lagna)
    2: { x: 100, y: 48, labelY: 28 }, // Top Left Triangle
    3: { x: 42, y: 105, labelY: 80 }, // Upper Left Flank
    4: { x: 105, y: 200, labelY: 165 }, // Left Diamond
    5: { x: 42, y: 295, labelY: 275 }, // Lower Left Flank
    6: { x: 100, y: 355, labelY: 335 }, // Bottom Left Triangle
    7: { x: 200, y: 290, labelY: 250 }, // Bottom Diamond
    8: { x: 300, y: 355, labelY: 335 }, // Bottom Right Triangle
    9: { x: 358, y: 295, labelY: 275 }, // Lower Right Flank
    10: { x: 295, y: 200, labelY: 165 }, // Right Diamond
    11: { x: 358, y: 105, labelY: 80 }, // Upper Right Flank
    12: { x: 300, y: 48, labelY: 28 }, // Top Right Triangle
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-xl border border-slate-300 p-3 sm:p-4 shadow-sm">
      <div className="w-full aspect-square relative bg-white border-2 border-slate-400">
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Chart Geometric Grid Lines */}
          <g stroke="#94a3b8" strokeWidth="1.5" fill="none">
            {/* Outer Box */}
            <rect x="0" y="0" width="400" height="400" stroke="#64748b" strokeWidth="2" />
            {/* Diagonals */}
            <line x1="0" y1="0" x2="400" y2="400" />
            <line x1="400" y1="0" x2="0" y2="400" />
            {/* Inner Diamond */}
            <polygon points="200,0 400,200 200,400 0,200" stroke="#64748b" strokeWidth="1.8" />
          </g>

          {/* House Contents */}
          {Array.from({ length: 12 }, (_, i) => i + 1).map((houseNum) => {
            const pos = housePositions[houseNum];
            const signNumber = ((ascSignIndex + houseNum - 1) % 12) + 1;
            const planets = calculation.houses[houseNum] || [];
            const isLagnaHouse = houseNum === 1;

            return (
              <g key={houseNum}>
                {/* Sign Number Indicator */}
                <text
                  x={pos.x}
                  y={pos.labelY}
                  textAnchor="middle"
                  className="fill-slate-400 font-mono text-[11px] font-semibold"
                >
                  {signNumber}
                  {isLagnaHouse ? ' (Asc)' : ''}
                </text>

                {/* Planets text cluster */}
                <g transform={`translate(${pos.x}, ${pos.y})`}>
                  {planets.filter((p) => p.name !== 'Ascendant').length === 0 ? (
                    <text
                      x="0"
                      y="5"
                      textAnchor="middle"
                      className="fill-slate-300 text-[10px]"
                    >
                      —
                    </text>
                  ) : (
                    planets
                      .filter((p) => p.name !== 'Ascendant')
                      .map((p, idx, arr) => {
                        const total = arr.length;
                        const row = Math.floor(idx / 2);
                        const col = idx % 2;
                        const xOffset = total === 1 ? 0 : col === 0 ? -14 : 14;
                        const yOffset = total <= 2 ? 0 : row === 0 ? -6 : 10;

                        return (
                          <text
                            key={p.name}
                            x={xOffset}
                            y={yOffset}
                            textAnchor="middle"
                            className="fill-slate-900 font-semibold text-[9.5px] font-mono"
                          >
                            <title>{`${p.name}: ${p.degreeFormatted}`}</title>
                            {p.symbol} {Math.floor(p.degreeInSign)}°
                          </text>
                        );
                      })
                  )}
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 px-1">
        <span>* House 1 is Top Diamond (Ascendant)</span>
        <span>Numbers indicate Rasi signs (1=Aries ... 12=Pisces)</span>
      </div>
    </div>
  );
};
