import { Drawer, Button, Tag, Divider, Typography } from 'antd';
import React, {useState, useContext} from 'react';
import { addEdge } from 'react-flow-renderer';
import PredicateCheckBox from './PredicateCheckBox'
import { PRED_COLOR_V2 } from '../../constants';
import { Context } from '../../Store';
import './index.css'
import PredicateDraw from './PredicateDraw';
import { getNodeId } from '../../utils/getNodeId';
const {Title} = Typography

const NodePredicateModal = ({
  visible,
  onClose,
  node,
  nodeId,
  targets,
  attributes,
  predicates,
  addPredicate,
  deletePredicate,
  updatePredicate,
  currPos,
  propData,
}) => {
  const [childrenDrawer, setChildDrawer] = useState({});
  const [state, dispatch] = useContext(Context);

  const showChildrenDrawer = (attr) => {
    setChildDrawer({
      ...childrenDrawer,
      [attr]: true
    })
  };

  const onChildrenDrawerClose = (attr) => {
    setChildDrawer({
      ...childrenDrawer,
      [attr]: false
    })
  };

  //* Add Target node (new)
  const addTarget = (destNode) => {
    // set connected of existing node to true
    dispatch({
      type: 'MODIFY_NODE_DATA',
      payload: { node: nodeId, prop: 'connected', newVal: true }
    });
    // add new node
    // const getNodeId = () => {
    //   if (!state.nodes.length) {
    //     return '0';
    //   } else return `${parseInt(state.nodes.length)}`;
    // };

    var possibleNeighbours = state.neighbours[destNode].map(function (rs) {
      return rs.label;
    });

    const destId = getNodeId();
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
            VEDAPosition: [],
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

  return (
      <Drawer
        title={<Title style={{marginBottom: 0}}level={3}>{node}</Title>}
        placement="left"
        closable={false}
        onClose={onClose}
        visible={visible}
      >
        <Divider orientation="left">Selected Predicates</Divider>

        <div style={{padding: '0px 15px 10px'}}>
          {Object.keys(predicates).map((attr, i) => {
            const colour = PRED_COLOR_V2[attributes.indexOf(attr) % PRED_COLOR_V2.length]
            return (
              <div key={`pt-${i}`}>
                <Tag
                  className='predicate-tag'
                  onClick={() => {showChildrenDrawer(attr)}}
                  key={`${attr}-k`}
                  color={colour.name}
                >
                  {attr}
                </Tag>
                <PredicateDraw
                  onClose={() => onChildrenDrawerClose(attr)}
                  attr={attr}
                  oldPredicate={{ attr: attr, preds: predicates[attr] }}
                  updatePredicate={updatePredicate}
                  deletePredicate={deletePredicate}
                  propValues={propData
                    .filter((item) => Object.keys(item).includes(attr))
                    .map((item) => item[attr])
                  }
                  titleColor={colour.secondary}
                  visible={childrenDrawer[attr]}/>
              </div>
            )
          })}
        </div>

        <Divider orientation="left">Properties</Divider>

        <div style={{padding: '0px 15px 10px'}}>
          {attributes.map((attr, i) => (
              <PredicateCheckBox
                key={`${attr}-k`}
                title={attr}
                checked={Object.keys(predicates).indexOf(attr) !== -1}
                onAddPredicate={() => {
                  addPredicate(attr)
                  setChildDrawer({
                    ...childrenDrawer,
                    [attr]:true
                  })
                  }
                }
                onDeletePredicate={() => {
                  deletePredicate(attr)
                }}
                palette={PRED_COLOR_V2[i % PRED_COLOR_V2.length]} />
            ))
          }

        </div>
        <Divider orientation="left">Possible Targets</Divider>
        {
          targets.map((target, i) => {
            return (
              <Button
                style={{marginRight: 8}}
                key={`${i}`}
                onClick={() => {
                  addTarget(target)
                  onClose()
                }} type="text">
                {target}
              </Button>
            )
          })
        }

      </Drawer>
  );
}

export default NodePredicateModal
