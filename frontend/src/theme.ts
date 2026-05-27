import { createTheme, MantineColorsTuple } from '@mantine/core';

const saGreen: MantineColorsTuple = [
  '#e8f5ed',
  '#d1eadb',
  '#a3d5b7',
  '#72bf91',
  '#4aab71',
  '#2e9d5c',
  '#1a5632',
  '#1a5632',
  '#154528',
  '#0f341e',
];

const saGold: MantineColorsTuple = [
  '#fef6e2',
  '#fceccc',
  '#f8d99a',
  '#f3c463',
  '#efb337',
  '#eca71a',
  '#e8a817',
  '#cd9210',
  '#b78108',
  '#9f6e00',
];

export const theme = createTheme({
  primaryColor: 'saGreen',
  colors: {
    saGreen,
    saGold,
  },
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  headings: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  defaultRadius: 'sm',
});
