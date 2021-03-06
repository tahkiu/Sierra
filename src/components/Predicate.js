import React from 'react';
import PredicateFormModal from './PredicateFormModal';

function Predicate(props) {
  // size of property circle depends on number of predicates on property
  const predRadius = 6 + 2*props.predicate.preds.length;
  const predicateStyle = {
    background: props.color,
    position: 'absolute',
    // position of predicate depends on size of node
    top: props.nodeRad - parseInt(Math.round(props.nodeRad * Math.cos(props.theta))) - predRadius + 'px', // theta.push((2 * i * Math.PI) / n);
    left: props.nodeRad + parseInt(Math.round(props.nodeRad * Math.sin(props.theta))) - predRadius + 'px',
    width: predRadius * 2 + 'px',
    height: predRadius * 2 + 'px',
    border: '1px solid black',
    borderRadius: '50%',
  };
  // x + R * cos(theta + (i)2pi/kn)
  return (
    <div>
      <div onClick={() => props.togglePred(props.index)} style={predicateStyle}></div>
      <PredicateFormModal
        color={props.color}
        oldPred={props.predicate}
        changePredicate={props.changePred}
        delPredicate={props.delPred}
        isOpen={props.open}
        propValues={props.propValues}
        hide={() => props.togglePred(props.index)}
      />
    </div>
  );
}

export default Predicate;
