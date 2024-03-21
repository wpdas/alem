### About

Aqui estão alguns dos arquivos cruciais para definir os componentes do Além que devem ser injetados durante a compilação dos schemas. Também está presente lista de métodos ou recursos que devem ser evitados de serem enviados como parametros para outros Widgets.

Cada arquivo tem sua descrição no topo.

### Importable Files

- **`importableAlemFileSchemas.js`:** é usado para retornar o esquema já processado de todos os arquivos importáveis do Além. Eles são injetados no esquema de arquivos principais quando inicia o processamento dos arquivos do projeto.

- **`importableFiles.js`:** é usado para verificar se um recurso importado no projeto vem do `alem` (ex: `import { useContext } from 'alem'`). Caso for, o compilador usará este arquivo para saber o diretório do arquivo sendo importado do além.
