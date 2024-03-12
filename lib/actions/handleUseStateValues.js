const { USESTATE_VALUES } = require("../regexp");
const { create_new_name } = require("../utils");

/**
 * Handle the useState values creating a new name for them to avoid
 * conflicts over the app as it uses only one instance of state for the widget
 *
 * @param {{filePath: string, toImport: string[], content: string}[]} fileSchemas schemas to change the files content when a item gets its name changed
 */
const handleUseStateValues = (fileSchemas) => {
  // console.log(fileSchemas);
  fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
    let currentFileContent = fileSchema.content;
    const useStateList = currentFileContent.match(USESTATE_VALUES);
    // Se achar valores de useState, atualiza no conteúdo do arquivo
    if (useStateList) {
      // loop through found values
      useStateList.forEach((useStateCases) => {
        // get values
        const [getter, setter] = useStateCases.split(",");

        // create new name for them and update the schema file content
        const newGetterName = create_new_name(true);
        const newSetterName = create_new_name(true);

        // change names in file content
        if (getter) {
          const replaceGetterRegexp = new RegExp(
            "\\b" + getter.replaceAll(" ", "") + "\\b",
            "gm",
          );

          currentFileContent = currentFileContent.replaceAll(
            replaceGetterRegexp,
            newGetterName,
          );
        }

        if (setter) {
          const replaceSetterRegexp = new RegExp(
            "\\b" + setter.replaceAll(" ", "") + "\\b",
            "gm",
          );

          currentFileContent = currentFileContent.replaceAll(
            replaceSetterRegexp,
            newSetterName,
          );
        }

        fileSchemas[fileSchemaIndex].content = currentFileContent;
      });
    }
  });

  return fileSchemas;
};

module.exports = handleUseStateValues;
