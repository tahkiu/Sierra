import React, {useContext} from 'react';
import { removeElements, addEdge, isEdge } from 'react-flow-renderer';
import { COLORS } from '../../constants';
import { Context } from '../../Store';
import { getNodeId } from '../../utils/getNodeId';
import { Circle, Arrow } from './shapes';

const useVEDAOperators = () => {
  const [state, dispatch] = useContext(Context);

  class VEDAOperatorController {
    process(graph, op, payload = {}){
      if (op.length == 0) {
        throw "incorrect operators"
      }

      if (op[0] === "APPEARS") {
        return this.appears(graph, op.slice(1), payload)
      } else if (op[0] === "DISAPPEARS") {
        return this.disappears(graph, op.slice(1), payload)
      } else if (["CIRCLE", "ARROW"].indexOf(op[0]) !== -1){
        return this.update(graph, op, payload)
      } else {
        throw "unhandled operators"
      }
    }

    appears(graph, op, payload) {
      //* add a new node
      if (op[0] === "CIRCLE") {
        let arr = op[1].split(".")
        if (arr.length === 1) {
          //* add a new node
          return this.addNewNode(graph, op[1], payload)
        } else {
          //* add a new predicate (need to distinguish node and arrow)
          return this.addNewPredicate(graph, payload)
        }
      } else if (op[0] === "ARROW") {
          //* add a new arrow
          return this.addNewEdge(graph, payload)
      }
    }

    disappears(graph, op, payload) {
      //* delete a node
      if (op[0] === "CIRCLE") {
        let arr = op[1].split(".")
        if (arr.length === 1) {
          //* add a new node
          return {
            ...graph,
            nodes: removeElements(payload.el, graph.nodes)
          }
        } else {
          return this.deletePredicate(graph, payload)
        }
      } else if (op[0] === "ARROW") {
          //* add a new arrow
          return this.deleteEdge(graph, payload)
      }
    }

    update(graph, op, payload) {
      //* currently only support update of predicate and edge
      if (op[0] === "CIRCLE") {
        //* update predicate value

        let newNodes = [...graph.nodes]
        const nodeTBC = newNodes.find((el) => el.id === payload.parent)

        if(nodeTBC) {
          const {index, label, newVal, attr} = payload
          const predCircle = nodeTBC.data.predicates[attr]
          predCircle.data[index][label] = newVal
          return {
            ...graph,
            nodes: newNodes
          }
        } else { //* parent is an edge

          let newEdges = [...graph.edges]
          const edgeTBC = newEdges.find((el) => el.id === payload.parent)
          const {index, label, newVal, attr} = payload
          const predCircle = edgeTBC.data.predicates[attr]
          predCircle.data[index][label] = newVal

          return {
            ...graph,
            edges: newEdges
          }
        }

      } else if (op[0] === "ARROW") {
          //* update edge

          const newEdges = [...graph.edges];
          const edgeTBC = newEdges.find((el) => el.id === payload.edge);
          edgeTBC[payload.prop] = payload.newVal;

          return {
            ...graph,
            edges: newEdges,
          }
      }
    }

    //* lower level functions
    addNewNode(graph, nodeName, payload = {}) {
      const addData = payload.data ?? {}
      var possibleNeighbours = graph.neighbours[nodeName].map(function (rs) {
        return rs.label;
      });
      possibleNeighbours = [...new Set(possibleNeighbours)];
      const id = payload.id ?? getNodeId()
      const circle = new Circle({
        id,
        position: { x: 500, y: 200 },
        color: COLORS[parseInt(id, 10)],
        type: 'special',
        componentType: "NODE",
        ...payload,
        data: {
          label: nodeName,
          attributes: graph.props[nodeName],
          possibleTargets: possibleNeighbours,
          connected: false,
          predicates: {},
          VEDAPosition: [],
          ...addData
        },
      })

      return {
        ...graph,
        nodes: [...graph.nodes, circle]
      }
    }

    addNewPredicate(graph, payload) {
      //* create predicate circle
      const {attr, vals, color = {}, parent} = payload
      const predCircle = new Circle({
        id: attr,
        data: [vals],
        color,
        componentType: "PREDICATE",
      })
      //* identify node / edge from graph

      let newNodes = [...graph.nodes]
      const nodeTBC = newNodes.find((el) => el.id === parent)

      if(nodeTBC) { //* parent is a node
        const preds = nodeTBC.data.predicates
        if (attr in preds) {
          //* already have this predicate, joining a new one
          preds[attr].join(predCircle)
        } else {
          nodeTBC.join(predCircle)
        }

        return {
          ...graph,
          nodes: newNodes
        }

      } else { //* parent is an edge

        let newEdges = [...graph.edges]
        const edgeTBC = newEdges.find((el) => el.id === parent)
        const preds = edgeTBC.data.predicates
        if (attr in preds) {
          //* already have this predicate, joining a new one
          preds[attr].join(predCircle)
        } else {
          edgeTBC.join(predCircle)
        }

        return {
          ...graph,
          edges: newEdges
        }
      }
    }

    deletePredicate(graph, payload) {
      const {attr, deleteAll, parent, index} = payload
      let newNodes = [...graph.nodes]
      const nodeTBC = newNodes.find((el) => el.id === parent)
      if(nodeTBC) { //* parent is a node
        if(deleteAll) {
          //* remove all circles from predicate list
          nodeTBC.detach(attr)
        } else {
          //* remove one circle from predicate list
          const preds = nodeTBC.data.predicates
          if (attr in nodeTBC.data.predicates) {
            preds[attr].detach(index)
          }
        }

        return {
          ...graph,
          nodes: newNodes
        }

      } else { //* parent is an edge
        let newEdges = [...graph.edges]
        const edgeTBC = newEdges.find((el) => el.id === parent)

        if(deleteAll) {
          //* remove all circles from predicate list
          edgeTBC.detach(attr)
        } else {
          //* remove one circle from predicate list
          const preds = edgeTBC.data.predicates
          if (attr in edgeTBC.data.predicates) {
            preds[attr].detach(index)
          }
        }

        return {
          ...graph,
          edges: newEdges
        }
      }

    }

    addNewEdge(graph, payload) {
      let { params, destNode } = payload
      const nodesCpy = graph.nodes;
      const allNeighbours = graph.neighbours;
      const src = nodesCpy.find((el) => el.id === params.source);
      const dest = nodesCpy.find((el) => el.id === params.target)
      const srcNeighbours = allNeighbours[src.data.label].map((rs) => {
        return rs.label;
      });

      console.log('current graph', nodesCpy)

      if(!destNode) {
        destNode = dest.data.label
      }

      let newParams = {...params}
      newParams.type = 'custom';
      newParams.arrowHeadType = 'arrowclosed';
      newParams.data = {
        source: src.data.label,
        destination: destNode,
        rs: '',
        relationships: [...allNeighbours[src.data.label]].filter(function (rs) {
          return rs.label === destNode;
        }),
        predicates: {}
      };
      newParams.id = `e${params.source}-${params.target}`
      const arrow = new Arrow(newParams)

      // dispatch({
      //   type: 'SET_EDGES',
      //   payload: [...graph.edges, arrow],
      // });
      // dispatch({
      //   type: 'MODIFY_NODE_DATA',
      //   payload: { node: params.target, prop: 'connected', newVal: true },
      // });
      // dispatch({
      //   type: 'MODIFY_NODE_DATA',
      //   payload: { node: params.source, prop: 'connected', newVal: true },
      // });

      const newNodes = [...graph.nodes]
      const dstNode = newNodes.find(el => el.id === params.target)
      const srcNode = newNodes.find(el => el.id === params.source)
      if(destNode){
        dstNode.data.connected = true
      }
      if(srcNode){
        srcNode.data.connected = true
      }

      return {
        ...graph,
        nodes: newNodes,
        edges: [...graph.edges, arrow]
      }

    }

    deleteEdge(graph, payload) {
      const elementsToRemove = payload.el
      var updatedEdges = removeElements(elementsToRemove, graph.edges);
      const newGraph = {...graph}
      const newNodes = [...newGraph.nodes]
      dispatch({
        type: 'SET_EDGES',
        payload: updatedEdges,
      });
      newGraph = {
        ...newGraph,
        edges: updatedEdges
      }
      for (var i = 0; i < elementsToRemove.length; i++) {
        if (isEdge(elementsToRemove[i])) {
          var srcId = elementsToRemove[i].source;
          var destId = elementsToRemove[i].target;
          // if nodes connected by the removed edge are no longer connected in graph, set data.connected to false
          if (updatedEdges.find((el) => el.source === srcId || el.dest === srcId) === undefined) {
            // dispatch({
            //   type: 'MODIFY_NODE_DATA',
            //   payload: { node: srcId, prop: 'connected', newVal: false },
            // });
            const srcNode = newNodes.find(el => el.id === srcId)
            if(srcNode){
              srcNode.data.connected = false
            }
          }
          if (updatedEdges.find((el) => el.source === destId || el.dest === destId) === undefined) {
            // dispatch({
            //   type: 'MODIFY_NODE_DATA',
            //   payload: { node: destId, prop: 'connected', newVal: false },
            // });
            const destNode = newNodes.find(el => el.id === srcId)
            if(destNode){
              destNode.data.connected = false
            }
          }
        }
      }
      return {
        ...newGraph,
        nodes: newNodes
      }

    }

  }

  return new VEDAOperatorController()

}

export default useVEDAOperators
