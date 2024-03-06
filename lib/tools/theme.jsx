/**
 * loadFonts: load external fonts
 * @param {string[]} fonts
 */
const loadFonts = (fonts) => {
  if (!fonts && !state.alemFontsLoaded) {
    return;
  }

  let fontsBody = "";
  const fontsTotal = fonts.length;
  let loadedFonts = 0;

  const loadFont = (fontURL) => {
    asyncFetch(fontURL).then((response) => {
      fontsBody += response.body;
      loadedFonts += 1;

      if (loadedFonts === fontsTotal) {
        State.update({ alemFontsLoaded: true, alemFontsBody: fontsBody });
      }
    });
  };

  fonts.forEach((fontURL) => {
    loadFont(fontURL);
  });

  return state.alemFontsLoaded;
};

// AlemTheme to support .css files and load external fonts
const AlemTheme = styled.div`
  ${state.alemFontsBody}
  ${alemCssBody}
`;
