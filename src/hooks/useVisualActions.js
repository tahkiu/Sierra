import React, {useContext} from 'react';

import useVEDAOperators from './useVEDAOperators';
const useVisualActions = () => {
  const vedaOperatorController = useVEDAOperators()
  class VisualActions {

    //* type === "NODE" | "EDGE" | "PREDICATE"
    add(graph, type, payload){
      const operators = []
      switch(type) {
        case "NODE" :
          //* call operator processor
          operators.push(...["APPEARS", "CIRCLE", payload.label])
          break;
        case "PREDICATE" :
          //* call operator processor
          operators.push(...["APPEARS", "CIRCLE", `${payload.label}.${payload.attr}`])
          break;
        case "EDGE" :
          //* call operator processor
          operators.push(...["APPEARS", "ARROW", payload.rs || ""])
          break;

      }

      return vedaOperatorController.process(graph, operators, payload)
    }

    //* type === "NODE" | "EDGE" | "PREDICATE"
    update(graph, type, payload){
      const operators = []
      switch(type) {
        case "NODE" :
          //* call operator processor
          operators.push(...["CIRCLE", payload.label])
          break;
        case "PREDICATE" :
          //* call operator processor
          operators.push(...["CIRCLE", `${payload.label}.${payload.attr}`])
          break;
        case "EDGE" :
          //* call operator processor
          operators.push(...["ARROW", payload.rs || ""])
          break;

      }

      return vedaOperatorController.process(graph, operators, payload)
    }
    //* type === "NODE" | "EDGE" | "PREDICATE"
    delete(graph, type, payload){
      const operators = []
      switch(type) {
        case "NODE" :
          //* call operator processor
          operators.push(...["DISAPPEARS", "CIRCLE", payload.label])
          break;
        case "PREDICATE" :
          //* call operator processor
          operators.push(...["DISAPPEARS", "CIRCLE", `${payload.label}.${payload.attr}`])
          break;
        case "EDGE" :
          //* call operator processor
          operators.push(...["DISAPPEARS", "ARROW", payload.rs || ""])
          break;

      }

      return vedaOperatorController.process(graph, operators, payload)
    }

    return(){
      //TODO: when have time argh
    }

    run(query){
      //* call the run api
    }

  }


  return new VisualActions()
}

export default useVisualActions
