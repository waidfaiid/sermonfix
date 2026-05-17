# SermonFix — Cursor Rules

## Coding Style
- Max function length: 30 lines
- No inline styles, only Tailwind classes (exception: Canvas/dynamic audio values)
- No comments except for complex DSP code
- Always prefer shadcn/ui or Radix primitives for interactive controls
- All UI labels German, all code English

## Components
- Props interface directly above the component
- Default exports for pages/screens, named exports for components
- No index.ts barrel files

## Audio Code
- Never call `new AudioContext()` directly — use `audioContextManager.initOnUserGesture()`
- DSP constants in `src/audio/constants.ts`
- Always debounce audio parameter updates (16ms)

## Forbidden
- No CSS files (use Tailwind only)
- No styled-components
- No `style={{}}` except Canvas and dynamic audio node values
- No `new AudioContext()` outside of user gesture handlers

## Icons
- Always use Lucide React
- Default size: `size={16}` or `size={20}`

## Do NOT rewrite
- Slider → @radix-ui/react-slider
- Dialog → @radix-ui/react-dialog  
- Switch → @radix-ui/react-switch
- All form controls → Radix primitives
