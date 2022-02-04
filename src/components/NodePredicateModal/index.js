import { Drawer, Button, Tag, Divider, Typography } from 'antd';
import React, {useState, useContext} from 'react';
import PredicateCheckBox from './PredicateCheckBox'
import { PRED_COLOR_V2 } from '../../constants';
import { Context } from '../../Store';
import './index.css'
import PredicateDraw from './PredicateDraw';
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
  // console.log(
  // 'node', node,
  // 'nodeId', nodeId,
  // 'targets', targets,
  // 'attributes', attributes,
  // 'predicates', predicates,
  // 'propData', propData,
  // )
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
              <>
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
              </>
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


      </Drawer>
  );
}

export default NodePredicateModal
