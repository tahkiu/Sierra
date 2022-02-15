import React, { useContext, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import Predicate from './Predicate';
import PredicateCountBubble from './PredicateCountBubble';
import { Handle } from 'react-flow-renderer';
import { Context } from '../Store';
import { BsPencilSquare, BsPlusCircle, BsFillEyeFill } from 'react-icons/bs';
import { addEdge } from 'react-flow-renderer';
import * as Constants from '../constants';
import NodePredicateModal from './NodePredicateModal'
const api = require('../neo4jApi');

function Node(props) {
  // const [predicates, setPredicates] = useState(props.data.predicates ?? {});
  const [showDetails, setShowDetails] = useState(false);
  const [state, dispatch] = useContext(Context);
  const [propData, setPropData] = useState([]);
  const predicates = props.data.predicates ?? {};
  const VEDAPosition = props.data.VEDAPosition;

  // for VEDA
  const [ranTheta] = useState(Math.random() * 2 * Math.PI)

  useEffect(async () => {
    const propValues = await api.fetchPropertyValues(props.data.label);
    setPropData(propValues);
  }, []);

  const _internalDispatchVEDAPosition = (val) => {
    dispatch({ type: 'MODIFY_NODE_DATA', payload: { node: props.id, prop: 'VEDAPosition', newVal: val } });
  }
  const _internalDispatchPredicates = (predicates) => {
    dispatch({ type: 'MODIFY_NODE_DATA', payload: { node: props.id, prop: 'predicates', newVal: predicates } });
  }

  var theta = {};
  var n = Object.keys(predicates).length;
  let i = 0
  // console.log('ranTheata is', ranTheta)
  // console.log('number of cirlces', VEDAPosition.length)
  for (const pre of VEDAPosition) {
    let angle = ranTheta + ((2 * i * Math.PI) / (VEDAPosition.length + 4))
      let checkAngle = angle % (Math.PI / 2)
      while ( checkAngle < 0.261799 || checkAngle > (Math.PI / 2) - 0.261799 ) {
        i++;
        // console.log('skipped angle', angle)
        angle = ranTheta + ((2 * i * Math.PI) / (VEDAPosition.length + 4))
        checkAngle = angle % (Math.PI / 2)
    }
    if (pre !== '') {
      // console.log(`${pre} assigned angle ${angle}`)
      theta[pre] = angle
    }
    i++;
  }

  //* for distinguishing drag and click
  const mousePos = useRef(null)
  const mouseDownCoords = (e) => {
    mousePos.current = {x: e.clientX, y: e.clientY}
  }
  const isClick = (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    return (mouseX < mousePos.current.x + 3 && mouseX > mousePos.current.x - 3)
      && (mouseY < mousePos.current.y + 3 && mouseY > mousePos.current.y - 3)
  }

  const addPredicate = (attr) => {
    _internalDispatchPredicates({ ...predicates, [attr]: [['0', '']] });
    for (const [index, pos] of VEDAPosition.entries()) {
      if (pos === ''){
        const newPos = [...VEDAPosition]
        newPos[index] = attr
        _internalDispatchVEDAPosition(newPos)
        return
      }
    }
    _internalDispatchVEDAPosition([...VEDAPosition, attr])

  };

  const updatePredicate = (newPred) => {
    //newPred: {attr: 'color', preds: [[0,1],[0,2]]
    _internalDispatchPredicates({ ...predicates, [newPred.attr]: newPred.preds });
  };

  const deletePredicate = (attr) => {
    var preds = JSON.parse(JSON.stringify(predicates));
    delete preds[attr];
    const i = VEDAPosition.indexOf(attr)
    if (i != -1){
      const newPos = [...VEDAPosition]
      newPos[i] = ''
      _internalDispatchVEDAPosition(newPos)
    }
    _internalDispatchPredicates(preds);
  };

  const preds = () => {
    switch(state.predDisplayStatus) {
      case "FULL" :
        return (
          Object.keys(predicates).map((attr, index) => (
            <Predicate
              key={attr}
              index={index}
              node={props.data.label}
              predicate={{ attr: attr, preds: predicates[attr] }}
              theta={theta[attr]}
              color={Constants.PRED_COLOR_V2[props.data.attributes.indexOf(attr) % Constants.PRED_COLOR_V2.length].secondary}
              nodeRad={(80 + Object.keys(predicates).length * 16) / 2}
            />
          ))
        );
      case "SEMI":
        if (Object.keys(predicates).length > 0){
          return (
            <PredicateCountBubble
              node={props.data.label}
              predicates={predicates}
              nodeRad={(80 + Object.keys(predicates).length * 16) / 2}
            />
          )
        } else {
          return (<div/>)
        }

      default:
        return(<div />)
    }
  }
  return (
    <div
      id={'node-' + props.data.label}
      className="node"
      style={{
        background: Constants.COLORS[(props.id) % Constants.COLORS.length],
        // size of node depends on number of properties present
        height: `${80 + Object.keys(predicates).length * 16}px`,
        width: `${80 + Object.keys(predicates).length * 16}px`,
      }}
    >
      <Handle type="target" position="left" style={{ zIndex: 100, height: '0.6rem', width: '0.6rem' }} />
      <Handle type="source" position="right" style={{ zIndex: 100, height: '0.6rem', width: '0.6rem' }} />
      {preds()}
      {/* {Object.keys(predicates).map((attr, index) => {
        // console.log(`IN NODE: , ${props.data.label}`)
        // console.log(`IN NODE: , ${attr} predicate`)
        // console.log('colour', props.data.attributes.indexOf(attr) % Constants.PRED_COLOR_V2.length)
        return preds(attr, index)

      })} */}

      <div style={{ position: 'relative', top: '50%', transform: 'translateY(-50%)' }}>
        <p className="h6"
          // onClick={(e) => {
          //   console.log(e)
          //   setShowDetails(!showDetails)}
          // }
          onMouseDown={e => mouseDownCoords(e)}
          onMouseUp={(e) => {
            if(isClick(e)) {
              setShowDetails(!showDetails)
            }
          }}
        >
          {props.data.label}
        </p>
      </div>
      <NodePredicateModal
        node={props.data.label}
        nodeId={props.id}
        targets={props.data.possibleTargets}
        attributes={props.data.attributes}
        predicates={predicates}
        visible={showDetails}
        addPredicate={addPredicate}
        deletePredicate={deletePredicate}
        updatePredicate={updatePredicate}
        propData={propData}
        currPos={[props.xPos, props.yPos]}
        onClose={() => {setShowDetails(false)}} />
    </div>
  );
}

export default Node;
