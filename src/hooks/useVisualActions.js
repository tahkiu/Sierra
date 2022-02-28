import React from 'react';
import useVEDAOperators from './useVEDAOperators';
const api = require('../neo4jApi');

const useVisualActions = () => {
  const vedaOperatorController = useVEDAOperators()
  class VisualActions {

    //* type === "NODE" | "EDGE" | "PREDICATE"
    add(graph, type, payload){
      const operators = []
      switch(type) {
        case "NODE" :
          //* call operator processor
          operators.push(...["APPEARS", "CIRCLE", payload.label, "BOLD", payload.label])
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

    return(graph, type, payload){
      const operators = []
      if(type === "NODE") {
        operators.push(...["BOLD", payload.label])
      }
      return vedaOperatorController.process(graph, operators, payload)
    }

    async run (query){
      //* call the run api
      return api.runQuery(query)
    }

  }


  return new VisualActions()
}

export default useVisualActions
