// Add textShadow
import { defineConfig, presetTypography, presetUno } from 'unocss';
import { parseColor, theme } from '@unocss/preset-mini';
import { colorToString } from '@unocss/preset-mini/utils';
import transformerVariantGroup from '@unocss/transformer-variant-group';

const FLEX_ALIGNS = {
  c: 'center',
  e: 'flex-end',
  s: 'flex-start',
  _: 'stretch',
};

export default defineConfig({
  presets: [presetUno(), presetTypography()],
  transformers: [transformerVariantGroup()],
  rules: [
    [
      /^flex([cse_])([cse_])$/,
      ([, c1, c2]) => ({
        display: 'flex',
        'align-items': FLEX_ALIGNS[c1],
        'justify-content': FLEX_ALIGNS[c2],
      }),
    ],
    [
      'text-shadow-1',
      {
        'text-shadow': '0 1px 1px rgba(0, 0, 0, 0.1)',
      },
    ],
    [
      'text-shadow-inner-1',
      {
        'text-shadow': '0 -1px 0 rgba(0, 0, 0, 0.5)',
      },
    ],
    [
      /^glow-(\w+)-(\w+)-([\w]+(?:\/\d+)?)$/,
      ([_, spread, size, color]) => {
        const parsedColor = parseColor(color, theme);
        let c = 'white';
        if (parsedColor && parsedColor.cssColor) {
          c = colorToString({ ...parsedColor.cssColor, alpha: parsedColor.alpha });
        }
        return {
          'box-shadow': `0 0 ${getSpread(spread)} ${getSize(size)} ${c}`,
        };
      },
    ],
  ],
  variants: [
    (matcher) => {
      if (!matcher.startsWith('hocus:')) return matcher;

      return {
        // slice `hover:` prefix and passed to the next variants and rules
        matcher: matcher.slice(6),
        selector: (s) => `${s}:hover, ${s}:focus`,
      };
    },
    (matcher) => {
      const variant = 'placeholder-shown';
      if (!matcher.includes(variant)) return matcher;
      const isNot = matcher.startsWith('not-');
      return {
        // slice `hover:` prefix and passed to the next variants and rules
        matcher: isNot ? matcher.slice(variant.length + 5) : matcher.slice(variant.length + 1),
        selector: (input) =>
          isNot ? `${input}:not(:placeholder-shown)` : `${input}:placeholder-shown`,
      };
    },
  ],
  theme: {
    breakpoints: {
      xs: '360px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    colors: {
      main: (() => {
        let colors: [string, string][] = [];
        for (let i = 10; i <= 90; i += 10) {
          colors.push([`${i}0`, `hsl(var(--main-hue), var(--main-saturation), ${i}%)`]);
        }
        colors.push([`950`, `hsl(var(--main-hue), var(--main-saturation), 95%)`]);
        return Object.fromEntries(colors);
      })(),
    },
  },
});

const getSpread = (s) =>
  ({
    sm: '1px',
    md: '3px',
    lg: '5px',
    xl: '8px',
  })[s] || `${s}px`;

const getSize = (s) =>
  ({
    sm: '1px',
    md: '4px',
    lg: '6px',
    xl: '8px',
  })[s] || `${s}px`;
