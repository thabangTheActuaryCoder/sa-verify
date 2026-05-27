import { createTheme, MantineColorsTuple } from '@mantine/core';

const saGreen: MantineColorsTuple = [
  '#E8F5E9',
  '#C8E6C9',
  '#A5D6A7',
  '#81C784',
  '#4CAF50',
  '#2E9D5C',
  '#0D8044',
  '#0a6636',
  '#074d28',
  '#05391d',
];

const saGold: MantineColorsTuple = [
  '#FFF3D6',
  '#FDEAB8',
  '#FBDE93',
  '#F8D06A',
  '#F5A623',
  '#E09418',
  '#C88212',
  '#A86D0D',
  '#8A5909',
  '#6E4607',
];

const saTerracotta: MantineColorsTuple = [
  '#FDEAE5',
  '#FAD0C5',
  '#F0A892',
  '#E67F5E',
  '#D4522A',
  '#C04823',
  '#A83D1E',
  '#8E3318',
  '#742913',
  '#5B200F',
];

export const theme = createTheme({
  primaryColor: 'saGreen',
  colors: {
    saGreen,
    saGold,
    saTerracotta,
  },
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  headings: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  defaultRadius: 'lg',
  components: {
    Card: {
      defaultProps: {
        shadow: 'sm',
        radius: 'lg',
      },
      styles: () => ({
        root: {
          border: '1px solid rgba(0, 0, 0, 0.06)',
        },
      }),
    },
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    Paper: {
      styles: () => ({
        root: {
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
        },
      }),
    },
    Table: {
      defaultProps: {
        borderRadius: 'md',
      },
    },
  },
});
