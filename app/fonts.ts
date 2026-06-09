import { Anton, Sora, Architects_Daughter } from 'next/font/google';

export const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-anton',
  display: 'swap',
});

export const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

export const architects = Architects_Daughter({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-architects',
  display: 'swap',
});
