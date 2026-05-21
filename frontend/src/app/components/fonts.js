// src/app/fonts.js
import { Newsreader } from 'next/font/google';

export const newsreader = Newsreader({
    subsets: ['latin'],
    display: 'swap',
    weight: ['400', '500', '600'],
});