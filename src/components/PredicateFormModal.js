import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { BsTrashFill } from 'react-icons/bs';
import Select from 'react-select';
import ConfirmationAlert from './ConfirmationAlert';
const neo4j = require('neo4j-driver');

function PredicateFormModal({ color, oldPred, changePredicate, delPredicate, isOpen, propValues, hide }) {
  const [predicate, setPredicate] = useState(JSON.parse(JSON.stringify(oldPred)));

  const [openSelect, setOpenSelect] = useState([]);

  var predsCount = predicate.preds.length;

  useEffect(() => {
    var arr = [];
    for (var i = 0; i < predsCount; i++) {
      arr.push(false);
    }
    setOpenSelect(arr);
  }, [predsCount]);

  const [isInt, setIsInt] = useState(false);

  const [options, setOptions] = useState([]);
  useEffect(() => {
    var isIntCpy = false;
    var optArr = propValues
      .map(function (item) {
        if (neo4j.isInt(item)) {
          setIsInt(true);
          isIntCpy = true;
          return neo4j.integer.toNumber(item);
        } else {
          return item;
        }
      });
    // sort list of options alphabetically or numerically depending on data type.
    if (isIntCpy){
      optArr = optArr.sort(function(a, b) {
        return a - b;
      });
      console.log(optArr);
    }
    else {
      optArr = optArr.sort();
    }
    const distinctOpts = [...new Set(optArr)].map(function (item) {
      return { label: item, value: item };
    });
    setOptions(distinctOpts);
  }, []);

  const handleChange = (index, i, newVal) => {
    var preds = [...predicate.preds];
    preds[index][i] = newVal;
    setPredicate({ ...predicate, preds: preds });
  };

  const addPredicate = () => {
    var preds = [...predicate.preds];
    preds.push(['0', '']);
    setOpenSelect(openSelect.concat([false]));
    setPredicate({ ...predicate, preds: preds });
  };

  const removePredicate = (i) => {
    var preds = [...predicate.preds];
    preds.splice(i, 1);
    setPredicate({ ...predicate, preds: preds });
  };

  const onOverlayClick = (e) => {
    // this is to stop click propagation in the react event system
    e.stopPropagation();
    // this is to stop click propagation to the native document click listener
    e.nativeEvent.stopImmediatePropagation();
  };

  const [alert, setAlert] = useState({ show: false, msg: '', confirm: () => {} });

  return isOpen
    ? ReactDOM.createPortal(
        <div
          className="modal-show"
          onClick={onOverlayClick}
          onMouseDown={onOverlayClick}
          onMouseUp={onOverlayClick}
          onTouchStart={onOverlayClick}
          onTouchEnd={onOverlayClick}
        >
          {alert.show ? (
            <ConfirmationAlert
              confirm={() => alert.confirm()}
              hide={() => setAlert({ ...alert, show: false })}
              msg={alert.msg}
              attr={oldPred.attr}
            />
          ) : null}
          <div className="container">
            <p className="font-weight-bold">Attribute:</p>
            <div className="p-2 text-center" style={color ? { color: 'white', background: color } : {}}>
              {oldPred.attr}
            </div>
          </div>
          <div>
            {predicate.preds.map(function (pred, index) {
              return (
                <div key={index} className="predicate-option">
                  <button
                    type="button"
                    onClick={() =>
                      setAlert({
                        show: true,
                        msg: 'Are you sure you want to remove this predicate for ',
                        confirm: function () {
                          removePredicate(index);
                        },
                      })
                    }
                    className="close hide-button"
                  >
                    <BsTrashFill />
                  </button>
                  <strong>Predicate #{index + 1}:</strong>
                  <div className="form-group d-flex">
                    <div className="mr-2">
                      <label>
                        <p>Operator </p>
                        {isInt ? (
                          <select
                            className="form-control"
                            defaultValue={pred[0]}
                            onChange={(e) => handleChange(index, 0, e.target.value)}
                          >
                            <option value="0">=</option>
                            <option value="1">&gt;</option>
                            <option value="2">&gt;=</option>
                            <option value="3">&lt;</option>
                            <option value="4">&lt;=</option>
                            <option value="5">&lt;&gt;</option>
                          </select>
                        ) : (
                          <select
                            className="form-control"
                            defaultValue={pred[0]}
                            onChange={(e) => handleChange(index, 0, e.target.value)}
                          >
                            <option value="0">=</option>
                            <option value="5">&lt;&gt;</option>
                          </select>
                        )}
                      </label>
                    </div>
                    <div className="w-100">
                      <label className="w-100">
                        <p>Predicate Value</p>
                        {pred[0] === '0' ? (
                          <Select
                            options={[...new Set(options)]}
                            isSearchable
                            onFocus={() => {
                              var tmp = [...openSelect];
                              tmp[index] = true;
                              setOpenSelect(tmp);
                            }}
                            onBlur={() => {
                              var tmp = [...openSelect];
                              tmp[index] = false;
                              setOpenSelect(tmp);
                            }}
                            menuIsOpen={openSelect[index]}
                            blurInputOnSelect
                            onChange={({ value }) => handleChange(index, 1, value)}
                            defaultValue={options.filter(function(option) {
                              return option.value === pred[1];
                            })}
                          />
                        ) : (
                          <input
                            type={isInt ? 'number' : 'text'}
                            className="form-control"
                            defaultValue={pred[1]}
                            onChange={(e) => handleChange(index, 1, isInt ? parseInt(e.target.value) : e.target.value)}
                          />
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="d-flex align-items-center justify-content-between my-2">
            <button
              type="button"
              className="btn btn-danger w-50 btn-block"
              onClick={() =>
                setAlert({
                  show: true,
                  confirm: function () {
                    delPredicate(predicate.attr);
                    hide();
                  },
                  msg: 'Are you sure you want to remove this attribute: ',
                })
              }
            >
              Delete
            </button>
            <button
              type="button"
              className="btn btn-success w-50 ml-2"
              onClick={() => {
                if (predicate.preds.length === 0) {
                  delPredicate(predicate.attr);
                } else {
                  changePredicate(predicate);
                }
                hide();
              }}
            >
              Save
            </button>
          </div>
          <div>
            <button type="button" className="btn btn-info btn-block" onClick={() => addPredicate()}>
              Add Predicate
            </button>
          </div>
          <div className="mt-4">
            <button type="button" className="btn btn-secondary btn-block" onClick={() => hide()}>
              Close
            </button>
          </div>
        </div>,
        document.getElementById('app-root'),
      )
    : null;
}

export default PredicateFormModal;
