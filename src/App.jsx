import React, { useState, useEffect, useContext } from 'react';
import Node from './components/Node';
import ReactFlow, { Controls, isEdge, addEdge, removeElements, Background, useStoreState } from 'react-flow-renderer';
import NewNodeDrawButton from './components/NewNodeDrawButton';
import PredicateDisplayDropDown from './components/PredicateDisplayDropDown';
import CypherTextEditor from './components/TextEditor'
import Help from './components/Help';
import SearchResults from './components/SearchResults';
import { Context } from './Store';
import CustomEdge from './components/CustomEdge';
import ConfirmationAlert from './components/ConfirmationAlert';
import {Button, Spin} from 'antd';
import {InfoCircleOutlined, CopyOutlined, LoadingOutlined} from '@ant-design/icons'
import Title from 'antd/lib/typography/Title';
import { getNodeId } from './utils/getNodeId';
import useVisualActions from './hooks/useVisualActions'

const api = require('./neo4jApi');

const NodesDebugger = () => {
  const nodes = useStoreState((state) => state.nodes);
  const edges = useStoreState(state => state.edges)
  console.log(nodes, edges);

  return null;
}

function App() {
  const VA = useVisualActions()
  const [state, dispatch] = useContext(Context);
  const [pageStatus, setPageStatus] = useState('LOADING');
  const [showResults, setShowResults] = useState(false);
  const [searchResult, setSearchResult] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const [toastInfo, setToastInfo] = useState({ show: false, msg: '', confirm: function () {} });
  const [cypherQuery, setCypherQuery] = useState('')

  const handleSearch = async () => {
    const res = await api.runQuery(cypherQuery); // VA.run()
    setSearchResult(res);
    setShowResults(true);
  };

  useEffect(() => {
    console.log('FROM APP: state change')
    console.log(state)
    if(state.nodes && state.nodes.length > 0){
      const cypherString = api.convertToQuery(state)
      console.log('FROM APP:', cypherString)
      setCypherQuery(cypherString)
    }
  }, [state])

  useEffect(() => {
    fetchData().then((res) => {
      dispatch({ type: 'SET_DATA', payload: res });
      setPageStatus("READY")
    });
    async function fetchData() {
      let result = await api.setUp();
      let props = await api.getProperties(result.entities);
      return { entities: result.entities, neighbours: result.neighbours, props: props };
    }
  }, []);

  const _internalDispatchPredDisplayStatus = (val) => {
    dispatch({
      type: 'SET_PRED_DISPLAY',
      payload: val
    })
  }

  const _internalDispatchGraph = (graph) => {
    dispatch({
      type: 'SET_GRAPH',
      payload: graph
    })
  }
  const onElementsRemove = (elementsToRemove) => {
    let graph
    if(elementsToRemove[0].data.label){
      graph = VA.delete(state, "NODE", {label: elementsToRemove[0].data.label, el: elementsToRemove})
    } else {
      graph = VA.delete(state, "EDGE", {
        el: elementsToRemove,
      })
    }
    _internalDispatchGraph(graph)
  };

  const onConnect = (params) => {
    const src = state.nodes.find((el) => el.id === params.source);
    const dest = state.nodes.find((el) => el.id === params.target);
    const srcNeighbours = state.neighbours[src.data.label].map((rs) => {
      return rs.label;
    });

    if (srcNeighbours.includes(dest.data.label)) {
      _internalDispatchGraph(VA.add(state, "EDGE", {params}))
    } else {
      setToastInfo({
        show: true,
        msg: `There is no data corresponding to an edge from ${src.data.label} to ${dest.data.label}. Are you sure you want to add this edge?`,
        confirm: function (){
          _internalDispatchGraph(VA.add(state, "EDGE", {params}))
        }
      });
    }
  };

  const addNode = (nodeName) => {
    _internalDispatchGraph(VA.add(state, "NODE", {label: nodeName}))
  }

  const renderContent = () => {
    if(pageStatus  === "LOADING") {
      return (
      <div style={{width: '100vw', height: '100vh'}}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 42 }} spin />} style={{margin:'35% 50%'}} />
      </div>)
    } else if (pageStatus === "READY") {
      return (
        <>
          <div>
            <div className="main-buttons">
              <Title style={{margin: 0}} level={3}>SIERRA</Title>
              <InfoCircleOutlined
                onClick={() => setShowHelp(!showHelp)}
                style={{
                  fontSize: '16px',
                  margin: '1px 14px 0px 6px'
                }}
              />
              <NewNodeDrawButton addNode={addNode}/>
              <PredicateDisplayDropDown value={state.predDisplayStatus} onSelect={_internalDispatchPredDisplayStatus} />
              <Button
                style={{
                  width: 120,
                  borderRadius: 4,
                  marginLeft: 'auto'
                }}
                type="primary"
                disabled={state.nodes.length === 0}
                onClick={handleSearch}
              >
                Play
              </Button>
            </div>
            {showHelp ? <Help hide={() => setShowHelp(false)} /> : null}
          </div>

          <CypherTextEditor text={cypherQuery}/>
          <ReactFlow
            elements={state.nodes.map(
                n => ({...n, data: {...n.data, color: n.color,radius:  n.radius}})
              )
              .concat(state.edges)}
            style={{ width: '100%', height: '100vh' }}
            nodeTypes={{ special: Node }}
            edgeTypes={{ custom: CustomEdge }}
            onElementsRemove={(elementsToRemove) =>
              setToastInfo({
                show: true,
                msg: `Are you sure you want to remove this ${isEdge(elementsToRemove[0]) ? 'edge' : 'node'}?`,
                confirm: () => onElementsRemove(elementsToRemove),
              })
            }
            onConnect={onConnect}
          >
            <Controls className='controls-custom' />
            <Background
              style={{backgroundColor: '#ECEFF2'}}
              variant="dots"
              color="#343330"
            />
            {/* <NodesDebugger /> */}
          </ReactFlow>

          {toastInfo.show ? (
            <ConfirmationAlert
              hide={() => setToastInfo({ ...toastInfo, show: false })}
              msg={toastInfo.msg}
              confirm={toastInfo.confirm}
              attr={toastInfo.attr ? toastInfo.attr : null}
            />
          ) : null}

          {showResults ? <SearchResults result={searchResult.result} query={searchResult.query} hide={() => setShowResults(false)} /> : null}
        </>
      )
    }
  }
  return (
    <div className="App" id="app-root">
      {renderContent()}
    </div>
  );
}

export default App;
