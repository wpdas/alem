## Modules

Thes files inside this folder are going to be injected to the global state and components using them will get only their references, so, saving
size for the final bundle file.

WARNING: If you want to use `props` inside the modules, you must pass it as a parameter. Modules live at the very top layer of Além and can't automatically access the props where it's being used.
