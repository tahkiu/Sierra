import React, { useRef, useEffect } from 'react';
import * as Constants from '../constants';
const neo4j = require('neo4j-driver');

function SearchResults(props) {
  const coloursArr =
    props.result.length > 0
      ? props.result[0].keys.map(function (key) {
          var index = key.charCodeAt(0) - 97;
          return Constants.COLORS[index % Constants.COLORS.length];
        })
      : null;

  const wrapperRef = useRef(null);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, false);
    return () => {
      document.removeEventListener('click', handleClickOutside, false);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      props.hide();
    }
  };

  return (
    <div ref={wrapperRef}>
      {/* <div
        className="p-4"
        style={{
          position: 'absolute',
          right: '0',
          top: '0',
          width: '15%',
          backgroundColor: '#F5F5F5',
          height: '100vh',
          zIndex: '30',
        }}
      >
        <h3>Query String</h3>
        {props.query}
      </div> */}
      <div className="result-modal-center">
        <button type="button" onClick={() => props.hide()} className="ml-2 mb-1 close hide-button">
          &times;
        </button>
        <h3>Results</h3>

        {props.result.length > 0 ? (
          <table className="w-100">
            <thead>
              <tr>
                {props.result[0]._fields.map(function (node, index) {
                  return (
                    // set colour of column headers to respective colour of node in constructed query graph
                    <td key={index} style={{ background: coloursArr[index] }}>
                      <b>{node.labels}</b>
                    </td>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {props.result.map(function (record, index) {
                return (
                  <tr key={index}>
                    {record._fields.map(function (node, index) {
                      return (
                      // set colour of column to respective colour of node in constructed query graph
                        <td key={index} className="px-2" style={{ background: coloursArr[index] }}>
                          {Object.keys(node.properties).map(function (key, i) {
                            return (
                              <div key={i}>
                                {key}:{' '}
                                {neo4j.isInt(node.properties[key])
                                  ? neo4j.integer.toString(node.properties[key])
                                  : node.properties[key]}
                              </div>
                            );
                          })}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div>
            <i>No results found</i>
          </div>
        )}

        <button type="button" className="btn btn-secondary btn-block mt-4" onClick={() => props.hide()}>
          Close
        </button>
      </div>
    </div>
  );
}

export default SearchResults;
