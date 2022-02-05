import React from 'react';
import { Button, Typography } from 'antd';
import {CopyOutlined} from '@ant-design/icons'
import CodeMirror from "@uiw/react-codemirror";
import { StreamLanguage } from "@codemirror/stream-parser";
import { cypher } from "@codemirror/legacy-modes/mode/cypher";

const { Title } = Typography
import './index.css'
export default function(){
  const dummyVal =
`// Cypher Mode for CodeMirror, using the neo theme
MATCH (joe { name: 'Joe' })-[:knows*2..2]-(friend_of_friend)
WHERE NOT (joe)-[:knows]-(friend_of_friend)
RETURN friend_of_friend.name, COUNT(*)
ORDER BY COUNT(*) DESC , friend_of_friend.name
  `

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
          // onClick={handleSearch}
        >
          Translate
        </Button>
      </div>
      <CodeMirror
        value={dummyVal}
        height="200px"
        extensions={[StreamLanguage.define(cypher)]}
        onChange={(value, viewUpdate) => {
          console.log("value:", value);
        }}
      />

    </div>
  )
}
