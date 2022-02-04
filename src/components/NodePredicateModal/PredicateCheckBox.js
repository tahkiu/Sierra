import React, {useState} from 'react';
import { Checkbox, Typography } from 'antd';
import './predicateCheckBox.css';

const {Text} = Typography
const PredicateCheckBox = ({checked, title, palette, onAddPredicate, onDeletePredicate}) => {
  // const [checked, setChecked] = useState(false)
  const [highlight, setHighlight] = useState(false)
  return (
    <div
      style={{
        backgroundColor: highlight ? palette.light : '#f7f7fa',
      }}
      onMouseEnter={() => {setHighlight(true)}}
      onMouseLeave={() => {setHighlight(checked)}}
      onClick={() => {
        if(checked) {
          onDeletePredicate()
        } else {
          onAddPredicate()
        }
        // setChecked(!checked)
      }}
      className="predicate-container">
      <Checkbox
        checked={checked}
        style={
          { height: 22,
            marginRight: 8,
            "--background-color": palette.primary,
            "--border-color": palette.secondary,

          }} />
      <Text style={{marginBottom: 0}}>{title}</Text>
    </div>
  )
}

export default PredicateCheckBox
