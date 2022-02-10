import React, { useContext, useState, useEffect } from 'react';
import { getBezierPath, getMarkerEnd } from 'react-flow-renderer';
import ReactDOM from 'react-dom';
import { Context } from '../Store';
import { BsPencilSquare, BsPlusCircle, BsFillEyeFill } from 'react-icons/bs';
import * as Constants from '../constants';
import Predicate from './Predicate';
import EdgeModal from './EdgeModal';

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

  const [directed, setDirected] = useState(true);
  const [state, dispatch] = useContext(Context);
  const [propData, setPropData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false)

  const edgePath = `M ${sourceX}, ${sourceY}L ${targetX}, ${targetY}`
  const markerEnd = getMarkerEnd(directed === true ? arrowHeadType : '', markerEndId);

  const predicates = data.predicates ?? {}
  const {rs} = data
  const isDirected = arrowHeadType === "arrowclosed"

  const toggleDirected = () => {
    updateEdgeRs("")
    dispatch({
      type: 'MODIFY_EDGE',
      payload: { edge: id, prop: 'arrowHeadType', newVal: isDirected ? '' : 'arrowclosed' },
    });
  }

  const updateEdgeRs = async (newRs) => {
    // console.log('updating edge RS with ', newRs)
    dispatch({ type: 'MODIFY_EDGE', payload: { edge: id, prop: 'data', newVal: { ...data, rs: newRs, predicates: {} } } });
    if (newRs !== '') {
      const propValues = await api.fetchEdgePropertyValues(newRs);
      setPropData(propValues);
    }
  }

  const _internalDispatchPredicates = (predicates) => {
    dispatch({ type: 'MODIFY_EDGE', payload: { edge: id, prop: 'data', newVal: { ...data, predicates: predicates } } })
  }

  const addPredicate = (attr) => {
    _internalDispatchPredicates({ ...predicates, [attr]: [['0', '']] });
  };

  const updatePredicate = (newPred) => {
    //newPred is in the format: {attr: 'color', preds: [[0,1],[0,2]]
    _internalDispatchPredicates({ ...predicates, [newPred.attr]: newPred.preds });
  };

  const deletePredicate = (attr) => {
    var preds = JSON.parse(JSON.stringify(predicates));
    delete preds[attr];
    _internalDispatchPredicates(preds);
  };

  let availRs = {};
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
        onClick={(e) => {
          // setShowEdit(!showEdit)
          e.stopPropagation()
          setModalVisible(true)
          }
        }
      >

      </path>
      {Object.keys(predicates).map((attr, index) => (
      <g key={attr} fill={Constants.PRED_COLOR_V2[availRs[rs].indexOf(attr) % Constants.PRED_COLOR_V2.length].secondary}
      stroke="black" strokeWidth="1">
        <circle onClick={
          (e)=>{
            e.stopPropagation()
            setModalVisible(true)
          }
        }
        cx={sourceX < targetX ? sourceX + (1+index) * Math.abs(sourceX-targetX)/(1+Object.keys(predicates).length) :
          sourceX - (1+index) * Math.abs(sourceX-targetX)/(1+Object.keys(predicates).length)}
        cy={sourceY < targetY ? sourceY + (1+index) * Math.abs(sourceY-targetY)/(1+Object.keys(predicates).length) :
          sourceY - (1+index) * Math.abs(sourceY-targetY)/(1+Object.keys(predicates).length) }
        r={6+2*predicates[attr].length} />
          <Predicate
            index={index}
            predicate={{ attr: attr, preds: predicates[attr] }}
            color={Constants.PRED_COLOR_V2[availRs[rs].indexOf(attr) % Constants.PRED_COLOR_V2.length].secondary}
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

      <text dy="-10px">
        <textPath href={`#${id}`} style={{ fontSize: '1rem' }} startOffset="50%" textAnchor="middle">
          {rs}
        </textPath>
      </text>
      <EdgeModal
        source={data.source}
        destination={data.destination}
        isDirected={isDirected}
        toggleDirected={toggleDirected}
        visible={modalVisible}
        onClose={() => {setModalVisible(false)}}
        allRs={availRs}
        rs={rs}
        updateEdgeRs={updateEdgeRs}
        predicates={predicates}
        addPredicate={addPredicate}
        updatePredicate={updatePredicate}
        deletePredicate={deletePredicate}
        propData={propData}
      />
    </>
  );
}

export default CustomEdge;
