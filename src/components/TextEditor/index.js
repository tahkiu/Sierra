import React, {useContext, useState} from 'react';
import { Button, Typography, message } from 'antd';
import {CopyOutlined} from '@ant-design/icons'
import CodeMirror from "@uiw/react-codemirror";
import { StreamLanguage } from "@codemirror/stream-parser";
import { cypher } from "@codemirror/legacy-modes/mode/cypher";
import { convertToGraph } from '../../utils/converToGraph';
import { Context } from '../../Store';
import { addEdge } from 'react-flow-renderer';
import './index.css';
import { resetCurAvailId, undoResetNodeId } from '../../utils/getNodeId';
import useVisualActions from '../../hooks/useVisualActions';
import {PRED_COLOR_V2} from '../../constants'

const { Title } = Typography

export default function({text}){
  const [state, dispatch] = useContext(Context);
  const VA = useVisualActions()
  const [innerText, setInnerText] = useState(text)
  const onCopy = () => {
    if(innerText){
      navigator.clipboard.writeText(innerText).then(() => {
          message.info('Successfully Copied Query to Clipboard')
      })
    }
  }
  const handleSearch = () => {
    try {
      resetCurAvailId()
      let {nodes: midNodes, edges: midEdges} = convertToGraph(innerText, state)
      let nodes = []
      let newGraph = {
        ...state,
        nodes: [],
        edges: []
      }

      for (const [key, n] of Object.entries(midNodes)) {

        let possibleNeighbours = state.neighbours[n.label].map(function (rs) {
          return rs.label;
        });
        possibleNeighbours = [...new Set(possibleNeighbours)];

        newGraph = VA.add(newGraph, "NODE", {
          id: n.nodeId,
          label: n.label,
          data: {
            connected: n.connected,
            rep: key,
          }
        })

        if(n.predicates) {
          for(const key in n.predicates) {
            const preds = n.predicates[key]
            const i = state.props[n.label].indexOf(key)
            const color = PRED_COLOR_V2[i % PRED_COLOR_V2.length]

            for(const [l, v] of preds) {
              newGraph = VA.add(newGraph, "PREDICATE", {
                attr: key,
                vals: [l, v],
                parent: n.nodeId,
                color,
              })
            }
          }
        }
      }

      for (const [key, e] of Object.entries(midEdges)) {
        newGraph = VA.add(newGraph, "EDGE", {
          params: {
            source: e.source,
            target: e.target,
          },
          addData: {
            rs: e.rs,
            rep: e.rep
          }
        })
        const edgeId = `e${e.source}-${e.target}`
        if(e.arrowHeadType) {
          newGraph = VA.update(newGraph, "EDGE", {
            edge: edgeId,
            prop: 'arrowHeadType',
            newVal: e.arrowHeadType
          })
        }

        if(e.predicates) {
          for(const key in e.predicates) {
            const preds = e.predicates[key]

            const {relationships} = newGraph.edges.find(el => el.id === edgeId).data
            let allRs = {}
            relationships.map(rsItem => {
              allRs[rsItem.type] = rsItem.props
            })
            const rsAttributes = e.rs ? allRs[e.rs] : []
            const i = rsAttributes.indexOf(key)
            const color = PRED_COLOR_V2[i % PRED_COLOR_V2.length]

            for(const [l, v] of preds) {
              newGraph = VA.add(newGraph, "PREDICATE", {
                attr: key,
                vals: [l, v],
                parent: edgeId,
                color,
              })
            }
          }
        }
      }
      //   var newParams = { source: e.source, target: e.target };
      //   newParams.type = 'custom';
      //   newParams.arrowHeadType = e.arrowHeadType;
      //   newParams.data = {
      //     source: e.dSource,
      //     destination: e.dTarget,
      //     rs: e.rs,
      //     rep: e.rep,
      //     relationships: [...state.neighbours[e.dSource]].filter(function (rs) {
      //       return rs.label === e.dTarget;
      //     }),
      //     predicates: e.predicates ? e.predicates : {}
      //   };
      //   edges = addEdge(newParams, edges)
      // }

      // dispatch({
      //   type: 'SET_NODES',
      //   payload: nodes,
      // })
      // dispatch({
      //   type: 'SET_EDGES',
      //   payload: edges
      // })
      dispatch({
        type: 'SET_GRAPH',
        payload: newGraph
      })
    } catch (e){
      undoResetNodeId()
      message.error(`Query unsupported by sierra, error message: ${e}` )
      throw ('error', e)
    }
  }

  return(
    <div style={{background: '#fff'}} className="text-container">
      <div style ={{display: 'flex', flexDirection: 'row', justifyContent:'space-between'}}>
        <Title level={5}>Cypher Query</Title>
        <CopyOutlined
          onClick={onCopy}
          style={{
            fontSize: '16px',
            margin: '7px 8px 0px auto'
          }}
          />
        <Button
          style={{
            fontSize: 13,
            height:30,
            borderRadius: 4,
          }}
          type="primary"
          // disabled={state.nodes.length === 0}
          onClick={handleSearch}
        >
          Translate
        </Button>
      </div>
      <CodeMirror
        value={text}
        height="200px"
        extensions={[StreamLanguage.define(cypher)]}
        onChange={(value) => {
          setInnerText(value);
        }}
      />

    </div>
  )
}
