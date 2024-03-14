// ALEM NEW ROUTE IMPLEMENTATION
// Expose navigate globally: This is going to be initialized by Route
let _alemNavigateMethod; // Usado para receber o método "navigate" gerado pelo Rout
const _alemNavigateFactory = (navigateMethod) => {
  // Funcao usada no Rout para receber o "navigate" e passar para o "_alemNavigateMethod"
  _alemNavigateMethod = navigateMethod;
};

// URL Params (BOS Props): propriedades do alem (widget principal)
let _alemProps = props;

// Usado para armazenar as rotas
let _alemRoutes = [];

// Usado para guardar o route type
let _alemRouteType = "URLBased"; //URLBased | ContentBased

// Nome do parametro a ser reconhecido como verificador de rota
let _alemRouteParameterName = "path";

// Used to force navigate to other paths even when the "path=" parameter is present into the URL
let _alemRouteBlocked = true;

// Rota ativa no momento, vai ser atualizada pelo Routes
let _activeRoute = "";

// Método a ser usado por Além: Vai usar o "_alemNavigateMethod" (wrapped "navigate")
const navigate = (route) => {
  if (_alemNavigateMethod) {
    _alemNavigateMethod(route);
  }
};

// Recebe a funcao de pegar as propriedades atuais da rota
let _alemGetRoutePropsMethod;

// Registra o metodo de pegar as propriedades da rota
let _alemRegisterGetRoutePropsMethod = (getRoutePropsMethod) => {
  _alemGetRoutePropsMethod = getRoutePropsMethod;
};
