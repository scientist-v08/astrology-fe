import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export default definePreset(Aura, {
    semantic: {
        primary: {
            50: '#f5f0fa',
            100: '#e8dff5',
            200: '#d4c2eb',
            300: '#b89ad9',
            400: '#8b5fc4',
            500: '#522793',
            600: '#461f7d',
            700: '#3d1d6e',
            800: '#2f1554',
            900: '#220f3d',
            950: '#150a28',
        },
        colorScheme: {
            light: {
                primary: {
                    color: '#522793',
                    inverseColor: '#ffffff',
                    hoverColor: '#6b3aad',
                    activeColor: '#3d1d6e',
                },
                highlight: {
                    background: '#e8dff5',
                    focusBackground: '#d4c2eb',
                    color: '#3d1d6e',
                    focusColor: '#220f3d',
                },
            },
        },
    },
});