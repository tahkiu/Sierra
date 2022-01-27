import React, { useContext, useState, useEffect } from 'react';
import { getBezierPath, getMarkerEnd } from 'react-flow-renderer';
import ReactDOM from 'react-dom';
import { Context } from '../Store';
import { BsPencilSquare, BsPlusCircle, BsFillEyeFill } from 'react-icons/bs';
import * as Constants from '../constants';
import Predicate from './Predicate';

const api = require('../neo4jApi');

function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {
    stroke: 'darkgrey',
    strokeWidth: '3',
  },
  data,
  arrowHeadType,
  markerEndId,
}) {
  const [rs, setRs] = useState('');
  const [directed, setDirected] = useState(true);

  const edgePath = `M ${sourceX}, ${sourceY}L ${targetX}, ${targetY}`
  const markerEnd = getMarkerEnd(directed === true ? arrowHeadType : '', markerEndId);

  const [showEdit, setShowEdit] = useState(false);
  const [predicates, setPredicates] = useState({});
  var n = Object.keys(predicates).length;
  const [predsIsOpen, setPredsIsOpen] = useState([]);
  const togglePredIsOpen = (index) => {
    var arr = [...predsIsOpen];
    arr[index] = !arr[index];
    setPredsIsOpen(arr);
  };

  useEffect(() => {
    var arr = [];
    for (var i = 0; i < n; i++) {
      arr.push(false);
    }
    setPredsIsOpen(arr);
    // default open latest added attribute for editing
    togglePredIsOpen(n - 1);
  }, [n]);

  const addPredicate = (attr) => {
    setPredicates({ ...predicates, [attr]: [['0', '']] });
  };

  const updatePredicate = (newPred) => {
    //newPred is in the format: {attr: 'color', preds: [[0,1],[0,2]]
    setPredicates({ ...predicates, [newPred.attr]: newPred.preds });
  };

  const deletePredicate = (attr) => {
    var preds = JSON.parse(JSON.stringify(predicates));
    delete preds[attr];
    setPredicates(preds);
  };

  const [state, dispatch] = useContext(Context);

  const [propData, setPropData] = useState([]);

  useEffect(async () => {
    dispatch({ type: 'MODIFY_EDGE', payload: { edge: id, prop: 'data', newVal: { ...data, rs: rs } } });
    if (rs !== '') {
      const propValues = await api.fetchEdgePropertyValues(rs);
      setPropData(propValues);
    }
  }, [rs]);

  useEffect(() => {
    if (directed === false) {
      setRs('');
    }
    dispatch({
      type: 'MODIFY_EDGE',
      payload: { edge: id, prop: 'arrowHeadType', newVal: directed ? 'arrowclosed' : '' },
    });
  }, [directed]);

  useEffect(() => {
    dispatch({ type: 'MODIFY_EDGE', payload: { edge: id, prop: 'data', newVal: { ...data, predicates: predicates } } });
  }, [predicates]);

  var availRs = {};
  data.relationships.map(function (rsItem) {
    availRs[rsItem.type] = rsItem.props;
  });

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        onClick={() => setShowEdit(!showEdit)}
      >
        
      </path>
      {Object.keys(predicates).map((attr, index) => (
      <g key={attr} fill={Constants.PRED_COLORS[availRs[rs].indexOf(attr) % Constants.PRED_COLORS.length]} 
      stroke="black" strokeWidth="1">
        <circle onClick={()=>togglePredIsOpen(index)}
        cx={sourceX < targetX ? sourceX + (1+index) * Math.abs(sourceX-targetX)/(1+Object.keys(predicates).length) :
          sourceX - (1+index) * Math.abs(sourceX-targetX)/(1+Object.keys(predicates).length)} 
        cy={sourceY < targetY ? sourceY + (1+index) * Math.abs(sourceY-targetY)/(1+Object.keys(predicates).length) : 
          sourceY - (1+index) * Math.abs(sourceY-targetY)/(1+Object.keys(predicates).length) } 
        r={6+2*predicates[attr].length} />
          <Predicate
            index={index}
            predicate={{ attr: attr, preds: predicates[attr] }}
            changePred={updatePredicate}
            delPred={deletePredicate}
            togglePred={togglePredIsOpen}
            open={predsIsOpen[index]}
            color={Constants.PRED_COLORS[availRs[rs].indexOf(attr) % Constants.PRED_COLORS.length]}
            propValues={propData
              .filter(function (item) {
                return Object.keys(item).includes(attr);
              })
              .map(function (item) {
                return item[attr];
              })}
          ></Predicate>
          </g>
        ))}

      <text>
        <textPath href={`#${id}`} style={{ fontSize: '1rem' }} startOffset="50%" textAnchor="middle">
          {rs}
        </textPath>
      </text>
      {showEdit ? (
        <Modal
          rs={rs}
          allRs={availRs}
          dir={directed}
          updateDirect={setDirected}
          src={data.source}
          dest={data.destination}
          updateRs={setRs}
          isOpen={showEdit}
          hide={() => setShowEdit(false)}
          addPredicate={addPredicate}
          togglePred={togglePredIsOpen}
          preds={predicates}
        />
      ) : null}
    </>
  );
}

function Modal({ rs, allRs, dir, updateDirect, src, dest, updateRs, isOpen, hide, addPredicate, togglePred, preds }) {
  const [predToAdd, setPredToAdd] = useState('');
  const [predToEdit, setPredToEdit] = useState('');
  const [viewPredDetails, setViewPredDetails] = useState(false);

  return isOpen
    ? ReactDOM.createPortal(
        <div className="modal-show">
          <h3>
            {src} to {dest}
          </h3>
          <hr />
          <div className="btn-group-toggle">
            <label className={'btn btn-outline-secondary my-2' + (dir ? ' active' : '')} htmlFor="directed">
              <input type="checkbox" checked={dir} id="directed" onChange={(e) => updateDirect(e.target.checked)} />
              Directed
            </label>
            {dir ? (
              <div className="form-group">
                <label className="font-weight-bold">Relationship</label>
                <select className="form-control" defaultValue={rs} onChange={(e) => updateRs(e.target.value)}>
                  <option value="">None</option>
                  {Object.keys(allRs).map(function (rs, index) {
                    return (
                      <option key={index} value={rs}>
                        {rs}
                      </option>
                    );
                  })}
                </select>
                {allRs.hasOwnProperty(rs) && allRs[rs].length > 0 ? (
                  <div className="my-3">
                    <label className="font-weight-bold">Predicates </label>
                    {Object.keys(preds).length > 0 ? (
                      <ul className="list-group list-group-flush">
                        {Object.keys(preds).map(function (prop, index) {
                          return (
                            <a
                              className="list-group-item list-group-item-action text-white"
                              style={{background: Constants.PRED_COLORS[allRs[rs].indexOf(prop) % Constants.PRED_COLORS.length]}}
                              key={index}
                              onMouseEnter={() => setPredToEdit(prop)}
                              onMouseLeave={() => setPredToEdit('')}
                            >
                              <div className="d-flex align-items-center justify-content-between text-white">
                                {prop}
                                {predToEdit === prop ? (
                                  <span className="d-flex">
                                    <button
                                      className="btn p-0 btn-sm ml-1 d-flex text-white"
                                      onClick={() => setViewPredDetails(!viewPredDetails)}
                                    >
                                      <BsFillEyeFill />
                                    </button>
                                    <button
                                      type="button"
                                      className="btn p-0 btn-sm ml-1 d-flex text-white"
                                      onClick={() => togglePred(index)}
                                    >
                                      <BsPencilSquare />
                                    </button>
                                  </span>
                                ) : null}
                              </div>
                              {predToEdit === prop && viewPredDetails === true
                                ? preds[prop].map(function (pred, i) {
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
                ) : null}

                {allRs.hasOwnProperty(rs) && allRs[rs].length > 0 ? (
                  <div>
                    <label className="font-weight-bold">Properties </label>
                    <ul className="list-group list-group-flush">
                      {allRs[rs].map(function (prop, index) {
                        return (
                          <button
                            key={index}
                            style={{background: Constants.PRED_COLORS[index]}}
                            className="list-group-item list-group-item-action d-flex align-items-center justify-content-between text-white"
                            disabled={Object.keys(preds).includes(prop)}
                            onMouseEnter={() => setPredToAdd(prop)}
                            onMouseLeave={() => setPredToAdd('')}
                          >
                            {prop}
                            {predToAdd === prop ? (
                              <a type="button" className="p-0 btn btn-sm text-white" onClick={() => addPredicate(prop)}>
                                <BsPlusCircle />
                              </a>
                            ) : null}
                          </button>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          <button type="button" className="btn btn-secondary btn-block" onClick={hide}>
            Close
          </button>
        </div>,

        document.getElementById('app-root'),
      )
    : null;
}

export default CustomEdge;
