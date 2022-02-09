import React, {useContext, useState} from 'react';
import { Button, Typography } from 'antd';
import {CopyOutlined} from '@ant-design/icons'
import CodeMirror from "@uiw/react-codemirror";
import { StreamLanguage } from "@codemirror/stream-parser";
import { cypher } from "@codemirror/legacy-modes/mode/cypher";
import { convertToGraph } from '../../utils/converToGraph';
import { Context } from '../../Store';
import { addEdge } from 'react-flow-renderer';
import './index.css';

const { Title } = Typography

export default function({text}){
  const [state, dispatch] = useContext(Context);
  const [innerText, setInnerText] = useState(text)
  const handleSearch = () => {
    try {
      let {nodes: midNodes, edges: midEdges} = convertToGraph(innerText, state)
      let nodes = []
      for (const [key, n] of Object.entries(midNodes)) {

        let possibleNeighbours = state.neighbours[n.label].map(function (rs) {
          return rs.label;
        });
        possibleNeighbours = [...new Set(possibleNeighbours)];

        //TODO: need to update position relatively
        nodes.push({
          id: n.nodeId,
          data: {
            label:n.label,
            connected: n.connected,
            attributes: state.props[n.label],
            possibleTargets: possibleNeighbours,
            connected: n.connected,
            predicates: n.predicates ? n.predicates : {},
            rep: key,
            VEDAPosition: Object.keys(n.predicates ?? {})
          },
          position: {x: 500, y: 200},
          type: 'special'
        })
      }

      let edges = []
      for (const [key, e] of Object.entries(midEdges)) {
        var newParams = { source: e.source, target: e.target };
        newParams.type = 'custom';
        newParams.arrowHeadType = e.arrowHeadType;
        newParams.data = {
          source: e.dSource,
          destination: e.dTarget,
          rs: e.rs,
          rep: e.rep,
          relationships: [...state.neighbours[e.dSource]].filter(function (rs) {
            return rs.label === e.dTarget;
          }),
          predicates: e.predicates ? e.predicates : {}
        };


        edges = addEdge(newParams, edges)
      }

      console.log('FROM TEXTEDITOR, NEW EDGES: ',edges)
      console.log('FROM TEXTEDITOR, NEW NODES:', nodes)
      dispatch({
        type: 'SET_NODES',
        payload: nodes,
      })
      dispatch({
        type: 'SET_EDGES',
        payload: edges
      })

    } catch (e){
      throw ('error', e)
    }
  }

  return(
    <div style={{background: '#fff'}} className="text-container">
      <div style ={{display: 'flex', flexDirection: 'row', justifyContent:'space-between'}}>
        <Title level={5}>Cypher Query</Title>
        <CopyOutlined
          onClick={() => console.log('copy cypher')}
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
