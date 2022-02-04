import React, { useContext, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import Predicate from './Predicate';
import { Handle } from 'react-flow-renderer';
import { Context } from '../Store';
import { BsPencilSquare, BsPlusCircle, BsFillEyeFill } from 'react-icons/bs';
import { addEdge } from 'react-flow-renderer';
import * as Constants from '../constants';
import NodePredicateModal from './NodePredicateModal'
const api = require('../neo4jApi');

function Node(props) {
  const [predicates, setPredicates] = useState({});
  const [showDetails, setShowDetails] = useState(false);
  const [state, dispatch] = useContext(Context);
  const [propData, setPropData] = useState();

  // for VEDA
  const [ranTheta] = useState(Math.random() * 2 * Math.PI)
  const [VEDAposition, setVEDAPosition] = useState([])
  var theta = {};
  var n = Object.keys(predicates).length;
  let i = 0
  for (const pre of VEDAposition) {
    let angle = ranTheta + ((2 * i * Math.PI) / (VEDAposition.length + 4))
      const checkAngle = angle % (Math.PI / 2)
      if ( checkAngle < 0.261799 || checkAngle > (Math.PI / 2) - 0.261799 ) {
        i++;
        angle = ranTheta + ((2 * i * Math.PI) / (VEDAposition.length + 4))
    }
    if (pre !== '') {
      theta[pre] = angle
    }
    i++;
  }

  // for distinguishing drag and click
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


  useEffect(async () => {
    const propValues = await api.fetchPropertyValues(props.data.label);
    setPropData(propValues);
  }, []);


  const [predsIsOpen, setPredsIsOpen] = useState([]);
  useEffect(() => {
    var arr = [];
    for (var i = 0; i < n; i++) {
      arr.push(false);
    }
    setPredsIsOpen(arr);
    // default open latest added attribute for editing
    togglePredIsOpen(n-1);
  }, [n]);

  const addPredicate = (attr) => {
    setPredicates({ ...predicates, [attr]: [['0', '']] });
    for (const [index, pos] of VEDAposition.entries()) {
      if (pos === ''){
        const newPos = [...VEDAposition]
        newPos[index] = attr
        setVEDAPosition(newPos)
        return
      }
    }
    setVEDAPosition([...VEDAposition, attr])

  };

  const updatePredicate = (newPred) => {
    //newPred: {attr: 'color', preds: [[0,1],[0,2]]
    setPredicates({ ...predicates, [newPred.attr]: newPred.preds });
  };

  const deletePredicate = (attr) => {
    var preds = JSON.parse(JSON.stringify(predicates));
    delete preds[attr];
    const i = VEDAposition.indexOf(attr)
    if (i != -1){
      const newPos = [...VEDAposition]
      newPos[i] = ''
      setVEDAPosition(newPos)
    }
    setPredicates(preds);
  };

  useEffect(() => {
    dispatch({ type: 'MODIFY_NODE_DATA', payload: { node: props.id, prop: 'predicates', newVal: predicates } });
  }, predicates);

  const togglePredIsOpen = (index) => {
    var arr = [...predsIsOpen];
    arr[index] = !arr[index];
    setPredsIsOpen(arr);
  };

  return (
    <div
      id={'node-' + props.data.label}
      className="node"
      style={{
        background: Constants.COLORS[(props.id - 1) % Constants.COLORS.length],
        // size of node depends on number of properties present
        height: `${80 + Object.keys(predicates).length * 10}px`,
        width: `${80 + Object.keys(predicates).length * 10}px`,
      }}
    >
      <Handle type="target" position="left" style={{ zIndex: 100, height: '0.6rem', width: '0.6rem' }} />
      <Handle type="source" position="right" style={{ zIndex: 100, height: '0.6rem', width: '0.6rem' }} />

      {Object.keys(predicates).map((attr, index) => (
        <Predicate
          key={attr}
          index={index}
          node={props.data.label}
          predicate={{ attr: attr, preds: predicates[attr] }}
          theta={theta[attr]}
          changePred={updatePredicate}
          delPred={deletePredicate}
          togglePred={togglePredIsOpen}
          open={predsIsOpen[index]}
          color={Constants.PRED_COLOR_V2[props.data.attributes.indexOf(attr) % Constants.PRED_COLOR_V2.length].secondary}
          nodeRad={(80 + Object.keys(predicates).length * 10) / 2}
          propValues={propData
            .filter(function (item) {
              return Object.keys(item).includes(attr);
            })
            .map(function (item) {
              return item[attr];
            })}
        ></Predicate>
      ))}

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

      {/* <Modal
        node={props.data.label}
        nodeId={props.id}
        targets={props.data.possibleTargets}
        attributes={props.data.attributes}
        predicates={predicates}
        isOpen={showDetails}
        hide={() => setShowDetails(false)}
        addPredicate={addPredicate}
        togglePred={togglePredIsOpen}
        currPos={[props.xPos, props.yPos]}
      /> */}
    </div>
  );
}

function Modal({ node, nodeId, targets, attributes, predicates, isOpen, hide, addPredicate, togglePred, currPos }) {
  const [predToAdd, setPredToAdd] = useState('');
  const [predToEdit, setPredToEdit] = useState('');
  const [targetToAdd, setTargetToAdd] = useState('');
  const [viewPredDetails, setViewPredDetails] = useState(false);
  const [state, dispatch] = useContext(Context);

  const addTarget = (destNode) => {
    // set connected of existing node to true
    dispatch({
      type: 'MODIFY_NODE_DATA',
      payload: { node: nodeId, prop: 'connected', newVal: true }
    });
    // add new node
    const getId = () => {
      if (!state.nodes.length) {
        return '1';
      } else return `${parseInt(state.nodes[state.nodes.length - 1].id) + 1}`;
    };
    var possibleNeighbours = state.neighbours[destNode].map(function (rs) {
      return rs.label;
    });
    const destId = getId();
    // remove duplicates
    possibleNeighbours = [...new Set(possibleNeighbours)];
    dispatch({
      type: 'SET_NODES',
      payload: [
        ...state.nodes,
        {
          id: destId,
          data: {
            label: destNode,
            attributes: state.props[destNode],
            possibleTargets: possibleNeighbours,
            connected: true,
            predicates: {},
          },
          position: { x: currPos[0] + 200, y: currPos[1] },
          type: 'special',
        },
      ],
    });
    // add new edge
    var newParams = { source: nodeId, target: destId };
    newParams.type = 'custom';
    newParams.arrowHeadType = 'arrowclosed';
    newParams.data = {
      source: node,
      destination: destNode,
      rs: '',
      relationships: [...state.neighbours[node]].filter(function (rs) {
        return rs.label === destNode;
      }),
      predicates: {}
    };
    dispatch({
      type: 'SET_EDGES',
      payload: addEdge(newParams, state.edges),
    });
  };

  return isOpen ? ReactDOM.createPortal(
    <div className='modal-show'>
      <h3>{node}</h3>
      <hr />
      <div className="pb-2">
        <div className="font-weight-bold">Predicates</div>

        {Object.keys(predicates).length ? (
          <ul className="list-group list-group-flush">
            {Object.keys(predicates).map(function (attr, index) {
              return (
                <a
                  key={index}
                  className={'list-group-item list-group-item-action text-white'}
                  style={{background: Constants.PRED_COLORS[attributes.indexOf(attr) % Constants.PRED_COLORS.length]}}
                  onMouseEnter={() => setPredToEdit(index)}
                  onMouseLeave={() => setPredToEdit('')}
                >
                  <div className="d-flex align-items-center justify-content-between text-white">
                    {attr}
                    {predToEdit === index ? (
                      <span className="d-flex">
                        <button
                          className="btn p-0 btn-sm ml-1 d-flex text-white"
                          onClick={() => setViewPredDetails(!viewPredDetails)}
                        >
                          <BsFillEyeFill />
                        </button>
                        <button className="btn p-0 btn-sm ml-1 d-flex text-white" onClick={() => togglePred(predToEdit)}>
                          <BsPencilSquare />
                        </button>
                      </span>
                    ) : null}
                  </div>
                  {predToEdit === index && viewPredDetails === true
                    ? predicates[attr].map(function (pred, i) {
                        return (
                          <div key={i}>
                            {Constants.OPERATORS[pred[0]]} {pred[1]},
                          </div>
                        );
                      })
                    : null}
                </a>
              );
            })}
          </ul>
        ) : (
          <div>
            <i>No predicates</i>
          </div>
        )}
      </div>
      <div className="pb-2">
        <div className="font-weight-bold">Properties</div>
        {attributes.length ? (
          <ul className="list-group list-group-flush">
            {attributes.map(function (attr, index) {
              return (
                <button
                  key={attr}
                  className="list-group-item list-group-item-action d-flex align-items-center justify-content-between text-white"
                  disabled={Object.keys(predicates).includes(attr)}
                  onMouseEnter={() => setPredToAdd(attr)}
                  onMouseLeave={() => setPredToAdd('')}
                  style={{background: Constants.PRED_COLORS[index % Constants.PRED_COLORS.length]}}
                >
                  {attr}
                  {predToAdd === attr ? (
                    <a
                      className="btn p-0 btn-sm text-white"
                      onClick={() => {
                        addPredicate(predToAdd);
                        setPredToAdd('');
                        hide();
                      }}
                    >
                      <BsPlusCircle />
                    </a>
                  ) : null}
                </button>
              );
            })}
          </ul>
        ) : (
          <div>
            <i>No associated properties</i>
          </div>
        )}
      </div>
      <div className="pb-2">
        <div className="font-weight-bold">Possible targets</div>
        {targets.length ? (
          <ul className="list-group list-group-flush">
            {targets.map(function (target, index) {
              return (
                <a
                  className="list-group-item list-group-item-action d-flex align-items-center justify-content-between"
                  key={index}
                  onMouseEnter={() => setTargetToAdd(target)}
                  onMouseLeave={() => setTargetToAdd('')}
                >
                  {target}
                  {targetToAdd === target ? (
                    <button
                      className="btn p-0 btn-sm"
                      onClick={() => {
                        addTarget(target);
                        setTargetToAdd('');
                        hide();
                      }}
                    >
                      <BsPlusCircle />
                    </button>
                  ) : null}
                </a>
              );
            })}
          </ul>
        ) : (
          <div>
            <i>No possible targets</i>
          </div>
        )}
      </div>

      <button type="button" className="btn btn-secondary btn-block mt-4" onClick={hide}>
        Close
      </button>
    </div>,

    document.getElementById('app-root'),
  ) : null;
}

export default Node;
