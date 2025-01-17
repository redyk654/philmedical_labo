import { alpha, createTheme, getContrastRatio } from "@mui/material";

const darkBase = '#161925';
const darkMain = alpha(darkBase, 0.95);

export const theme = createTheme({
    palette: {
        dark: {
            main: darkMain,
            light: alpha(darkBase, 0.4),
            dark: darkBase,
            contrastText: getContrastRatio(darkBase, '#ffffff') >= 3 ? '#ffffff' : '#000000'
        },
        salmon: {
            main: '#FF5733',
            light: alpha('#FF5733', 0.4),
            dark: alpha('#FF5733', 0.8),
            contrastText: getContrastRatio('#FF5733', '#ffffff') >= 3 ? '#ffffff' : '#000000'
        },
        light: {
            main: '#ffffff',
            light: alpha('#ffffff', 0.4),
            dark: alpha('#ffffff', 0.8),
            contrastText: getContrastRatio('#ffffff', '#000000') >= 3 ? '#000000' : '#ffffff'
        },
    },
});
