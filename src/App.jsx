import React, { useState, useEffect, useContext } from 'react';
import Node from './components/Node';
import ReactFlow, { Controls, isEdge, addEdge, removeElements } from 'react-flow-renderer';
import NodeForm from './components/NodeForm';
import NewNodeDrawButton from './components/NewNodeDrawButton'
import Help from './components/Help';
import { BsFillInfoCircleFill, BsFillPlayFill, BsPlusCircle } from 'react-icons/bs';
import SearchResults from './components/SearchResults';
import { Context } from './Store';
import CustomEdge from './components/CustomEdge';
import ConfirmationAlert from './components/ConfirmationAlert';
import logo from './assets/images/logo.png';
import {Button} from 'antd';

const api = require('./neo4jApi');

function App() {
  const [state, dispatch] = useContext(Context);
  const [pageStatus, setPageStatus] = useState('LOADING');
  const [nodeFormStatus, setShowNodeForm] = useState(false);
  const toggleNodeForm = () => {
    setShowNodeForm(!nodeFormStatus);
  };
  const [showResults, setShowResults] = useState(false);
  const [searchResult, setSearchResult] = useState([]);

  const [showHelp, setShowHelp] = useState(false);
  const [toastInfo, setToastInfo] = useState({ show: false, msg: '', confirm: function () {} });

  // run query using neo4j API and display results
  const handleSearch = async () => {
    const res = await api.runQuery(state);
    setSearchResult(res);
    setShowResults(true);
  };

  useEffect(() => {
    fetchData().then((res) => {
      dispatch({ type: 'SET_DATA', payload: res });
      setPageStatus("READY")
    });

    async function fetchData() {
      let result = await api.setUp();
      let props = await api.getProperties(result.entities);
      console.log('fetched', props)
      return { entities: result.entities, neighbours: result.neighbours, props: props };
    }
  }, []);

  const onElementsRemove = (elementsToRemove) => {
    var updatedEdges = removeElements(elementsToRemove, state.edges);
    dispatch({
      type: 'SET_EDGES',
      payload: updatedEdges,
    });
    for (var i = 0; i < elementsToRemove.length; i++) {
      if (isEdge(elementsToRemove[i])) {
        var srcId = elementsToRemove[i].source;
        var destId = elementsToRemove[i].target;
        // if nodes connected by the removed edge are no longer connected in graph, set data.connected to false
        if (updatedEdges.find((el) => el.source === srcId || el.dest === srcId) === undefined) {
          dispatch({
            type: 'MODIFY_NODE_DATA',
            payload: { node: srcId, prop: 'connected', newVal: false },
          });
        }
        if (updatedEdges.find((el) => el.source === destId || el.dest === destId) === undefined) {
          dispatch({
            type: 'MODIFY_NODE_DATA',
            payload: { node: destId, prop: 'connected', newVal: false },
          });
        }
      }
    }
    dispatch({
      type: 'SET_NODES',
      payload: removeElements(elementsToRemove, state.nodes),
    });
  };

  const onConnect = (params) => {
    var nodesCpy = state.nodes;
    var allNeighbours = state.neighbours;
    var src = nodesCpy.find((el) => el.id === params.source);
    var arr1 = allNeighbours[src.data.label].map((rs) => {
      return rs.label;
    });
    var dest = nodesCpy.find((el) => el.id === params.target);
    var newParams = JSON.parse(JSON.stringify(params));
    newParams.type = 'custom';
    newParams.arrowHeadType = 'arrowclosed';
    newParams.data = {
      source: src.data.label,
      destination: dest.data.label,
      rs: '',
      relationships: [...allNeighbours[src.data.label]].filter(function (rs) {
        return rs.label === dest.data.label;
      }),
      predicates: {}
    };
    if (arr1.includes(dest.data.label)) {
      dispatch({
        type: 'SET_EDGES',
        payload: addEdge(newParams, state.edges),
      });
      dispatch({
        type: 'MODIFY_NODE_DATA',
        payload: { node: dest.id, prop: 'connected', newVal: true },
      });
      dispatch({
        type: 'MODIFY_NODE_DATA',
        payload: { node: src.id, prop: 'connected', newVal: true },
      });
    } else {
      setToastInfo({
        show: true,
        msg: `There is no data corresponding to an edge from ${src.data.label} to ${dest.data.label}. Are you sure you want to add this edge?`,
        confirm: function (){
          dispatch({
            type: 'SET_EDGES',
            payload: addEdge(newParams, state.edges),
          });
          dispatch({
            type: 'MODIFY_NODE_DATA',
            payload: { node: dest.id, prop: 'connected', newVal: true },
          });
          dispatch({
            type: 'MODIFY_NODE_DATA',
            payload: { node: src.id, prop: 'connected', newVal: true },
          });
        }
      });
    }
  };

  const addNode = (nodeName) => {
    const getId = () => {
      if (!state.nodes.length) {
        return '1';
      } else return `${parseInt(state.nodes[state.nodes.length - 1].id) + 1}`;
    };
    var possibleNeighbours = state.neighbours[nodeName].map(function (rs) {
      return rs.label;
    });
    // remove duplicates
    possibleNeighbours = [...new Set(possibleNeighbours)];
    dispatch({
      type: 'SET_NODES',
      payload: [
        ...state.nodes,
        {
          id: getId(),
          data: {
            label: nodeName,
            attributes: state.props[nodeName],
            possibleTargets: possibleNeighbours,
            connected: false,
            predicates: {},
          },
          position: { x: 500, y: 200 },
          type: 'special',
        },
      ],
    });
    setShowNodeForm(false);
  };

  const renderContent = () => {
    if(pageStatus  === "LOADING") {
      return (<div> Loading ...</div>)
    } else if (pageStatus === "READY") {
      return (
        <>
          <div className="shadow-sm p-3 mb-3 bg-white d-flex justify-content-center main-buttons">
            <button type="button" className="btn btn-primary mr-1" onClick={toggleNodeForm}>
              <BsPlusCircle />
            </button>
            <NewNodeDrawButton addNode={addNode}/>
            <button
              type="button"
              className="btn btn-primary ml-1"
              disabled={state.nodes.length === 0}
              onClick={handleSearch}
            >
              <BsFillPlayFill />
            </button>
            <Button type="primary">Hello</Button>
          </div>

          <button type="button" onClick={() => setShowHelp(!showHelp)} className="help-button btn btn-outline-secondary">
            <BsFillInfoCircleFill />
          </button>

          {showHelp ? <Help hide={() => setShowHelp(false)} /> : null}

          <ReactFlow
            elements={state.nodes.concat(state.edges)}
            style={{ marginTop: '5rem', width: '100%', height: '700px' }}
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
            <Controls />
          </ReactFlow>

          {toastInfo.show ? (
            <ConfirmationAlert
              hide={() => setToastInfo({ ...toastInfo, show: false })}
              msg={toastInfo.msg}
              confirm={toastInfo.confirm}
              attr={toastInfo.attr ? toastInfo.attr : null}
            />
          ) : null}

          {/* {nodeFormStatus ? <NodeForm addNode={addNode} /> : null} */}
          {showResults ? <SearchResults result={searchResult.result} query={searchResult.query} hide={() => setShowResults(false)} /> : null}
        </>
      )
    }
  }
  return (
    <div className="App" id="app-root">
      <img src={logo} style={
        {
          position: 'fixed',
          top: '0',
          right:'3rem',
          width: '15rem'
        }}/>
      {renderContent()}
    </div>
  );
}

export default App;
