/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0b0f14",      // near-black graphite
        surface: "#141b24",   // panels
        surface2: "#1b2531",  // raised panels
        line: "#27323f",      // borders
        ink: "#e6edf3",       // primary text
        muted: "#8b98a8",     // secondary text
        teal: "#2dd4bf",      // primary accent (data/solver)
        good: "#34d399",      // correct / +EV
        bad: "#f87171",       // fold / -EV / wrong
        gold: "#f5b301",      // ICM pressure
        felt: "#123a2e",      // poker-felt surface accent
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};
