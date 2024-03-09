/**
 * loadExternalStyles: load external fonts and css styles
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
  ${state.alemExternalStylesBody}
  ${alemCssBody}
`;
