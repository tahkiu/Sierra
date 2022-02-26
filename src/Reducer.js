const Reducer = (state, action) => {
  switch (action.type) {
    case 'SET_PRED_DISPLAY':
      return {
        ...state,
        predDisplayStatus: action.payload
      };
    case 'SET_DATA':
      console.log('SETTING DATA');
      return {
        ...state,
        entities: action.payload.entities,
        neighbours: action.payload.neighbours,
        props: action.payload.props
      };
    case 'SET_GRAPH':
      console.log('SETTING GRAPH');
      return {
        ...state,
        nodes: action.payload.nodes,
        edges: action.payload.edges
      }
    case 'SET_NODES':
      console.log('SETTING nodes');
      return {
        ...state,
        nodes: action.payload,
      };
    case 'SET_EDGES':
      console.log('SETTING nodes');
      return {
        ...state,
        edges: action.payload,
      };
    case 'MODIFY_EDGE':
      console.log('MODFYING EDGE2');
      var newEdges = [...state.edges];
      var edgeTBC = newEdges.find((el) => el.id === action.payload.edge);
      edgeTBC[action.payload.prop] = action.payload.newVal;
      return {
        ...state,
        edges: newEdges,
      };
    case 'MODIFY_NODE':
      console.log('MODFIYING NODE DATA');
      var newNodes = [...state.nodes];
      var nodeTBC = newNodes.find((el) => el.id === action.payload.node);
      nodeTBC[action.payload.prop] = action.payload.newVal;
      return {
        ...state,
        nodes: newNodes,
      }
    case 'MODIFY_NODE_DATA':
      console.log('MODFIYING NODE DATA2');
      var newNodes = [...state.nodes];
      var nodeTBC = newNodes.find((el) => el.id === action.payload.node);
      nodeTBC.data[action.payload.prop] = action.payload.newVal;
      return {
        ...state,
        nodes: newNodes,
      };
    case 'ADD_TARGET':
      console.log('ADDING TARGET');
      var newNodes = [...state.nodes];
      var nodeTBC = newNodes.find((el) => el.id === action.payload.node);
      nodeTBC.data[action.payload.prop] = action.payload.newVal;
      return {
        ...state,
        nodes: newNodes,
      };

    // case 'SET_ERROR':
    //     return {
    //         ...state,
    //         error: action.payload
    //     };
    default:
      return state;
  }
};

export default Reducer;
