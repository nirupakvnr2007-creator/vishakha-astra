import mongoose, { Schema, Document } from 'mongoose';

export interface IHoroscopeRecord extends Document {
  userId?: string;
  fullName: string;
  gender: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  utcOffset: number;
  reportSummary: {
    lifeArchetype: string;
    coreEssence: string;
    keyThemes: string[];
  };
  calculationSnapshot: any;
  sections: Array<{
    id: string;
    category: string;
    theme: string;
    content: string;
    actionableAdvice: string;
  }>;
  createdAt: Date;
}

const HoroscopeRecordSchema: Schema = new Schema(
  {
    userId: { type: String, index: true },
    fullName: { type: String, required: true },
    gender: { type: String, default: 'unspecified' },
    birthDate: { type: String, required: true },
    birthTime: { type: String, required: true },
    birthPlace: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    utcOffset: { type: Number, required: true },
    reportSummary: {
      lifeArchetype: String,
      coreEssence: String,
      keyThemes: [String],
    },
    calculationSnapshot: { type: Schema.Types.Mixed },
    sections: [
      {
        id: String,
        category: String,
        theme: String,
        content: String,
        actionableAdvice: String,
      },
    ],
  },
  { timestamps: true }
);

export const HoroscopeRecord =
  mongoose.models.HoroscopeRecord ||
  mongoose.model<IHoroscopeRecord>('HoroscopeRecord', HoroscopeRecordSchema, 'horoscopes');
