import React, { useState, useContext, useEffect } from 'react';
import { BsFillEyeFill, BsPlusCircle } from 'react-icons/bs';
import { Context } from '../Store';
const api = require('../neo4jApi');

function NodeForm(props) {
  const [showAttr, setShowAttr] = useState({ show: false, entity: '' });
  const [selected, setSelected] = useState('');
  const [state, dispatch] = useContext(Context);

  useEffect(() => {
    async function fetchData() {
      let result = await api.setUp();
      let props = await api.getProperties(result.entities);
      return { entities: result.entities, neighbours: result.neighbours, props: props };
    }

    fetchData().then((res) => {
      dispatch({ type: 'SET_DATA', payload: res });
    });
  }, []);

  return (
    <div className="modal-show">
      <div className="font-weight-bold">Nodes Available</div>
      {state.entities.length ? (
        <ul className="list-group list-group-flush">
          {state.entities.map(function (node) {
            return (
              <a
                key={node}
                className="list-group-item list-group-item-action"
                onMouseEnter={() => setSelected(node)}
                onMouseLeave={() => setSelected('')}
              >
                <div className="d-flex align-items-center justify-content-between">
                  {node}
                  {selected === node ? (
                    <span className="d-flex">
                      <button
                        className="btn p-0 btn-sm ml-1 d-flex"
                        onClick={() => setShowAttr({ show: !showAttr.show, entity: selected })}
                      >
                        <BsFillEyeFill />
                      </button>
                      <button className="btn p-0 btn-sm ml-1 d-flex" onClick={() => props.addNode(node)}>
                        <BsPlusCircle />
                      </button>
                    </span>
                  ) : null}
                </div>
                {showAttr.show && showAttr.entity === selected && node === selected ? (
                  <div className="w-100 mt-2 d-flex flex-column">
                    <strong>Properties</strong>
                    <ul className="w-100 list-group list-group-flush">
                      {state.props[selected].map(function (attribute) {
                        return (
                          <li className="py-1 px-2 list-group-item list-group-item-secondary" key={attribute}>
                            <small>{attribute}</small>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
              </a>
            );
          })}
        </ul>
      ) : (
        'No nodes available'
      )}
    </div>
  );
}

export default NodeForm;
