/**
 * OBS: I tried to create a factory function to load external things,
 * but it causes the app to re-render infinitely
 */

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

/**
 * loadExternalStyles: load external css styles
 * @param {string[]} URLs
 */
const loadExternalStyles = (URLs) => {
  if (!URLs && !state.alemExternalStylesLoaded) {
    return;
  }

  let stylesBody = "";
  const totalItems = URLs.length;
  let loadedCounter = 0;

  const loadStyle = (styleURL) => {
    asyncFetch(styleURL).then((response) => {
      stylesBody += response.body;
      loadedCounter += 1;

      if (loadedCounter === totalItems) {
        State.update({
          alemExternalStylesLoaded: true,
          alemExternalStylesBody: stylesBody,
        });
      }
    });
  };

  URLs.forEach((styleURL) => {
    loadStyle(styleURL);
  });

  return state.alemExternalStylesLoaded;
};

// AlemTheme to support .css files and load external fonts
const AlemTheme = styled.div`
  ${state.alemFontsBody}
  ${state.alemExternalStylesBody}
  ${alemCssBody}
`;
