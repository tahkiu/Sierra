import { Drawer, Button, Typography, Divider, Card, Form, Select } from 'antd';
import { DeleteFilled } from '@ant-design/icons';
import React, {useState, useEffect} from 'react';
import { cssNumber } from 'jquery';

const neo4j = require('neo4j-driver');

const {Title} = Typography
const {Option} = Select;

const PredicateSelectorCard = ({
  removePredicate,
  handleChange,
  options,
  isInt,
  index,
  predVal,
}) => {
  const [form] = Form.useForm()
  return (
    <Card
      style={{marginBottom: 8}}
      size="small"
      title={`Predicate ${index + 1}`}
      extra={
        <Button size="small" shape="circle" icon={<DeleteFilled />} />
      }>
      <Form layout='inline'>
        <Form.Item >
          <Select
            onSelect={(val) => {
              handleChange(index, 0, val)
            }}
            value={predVal.op}
            placeholder="Op"
            style={{width: 59}}
            size="small"
          >
            {isInt ? (
              <>
                <Option value="0">=</Option>
                <Option value="1">&gt;</Option>
                <Option value="2">&gt;=</Option>
                <Option value="3">&lt;</Option>
                <Option value="4">&lt;=</Option>
                <Option value="5">&lt;&gt;</Option>
              </>

            ) : (
              <>
              <Option value="0">=</Option>
              <Option value="5">&lt;&gt;</Option>
              </>
            )}
          </Select>
        </Form.Item>
        <Form.Item>
          <Select
            onSelect={(val) => {
              handleChange(index, 1, val)
            }}
            value={predVal.value}
            style={{width: 210}}
            size="small"
            showSearch
            placeholder="Value"
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {options.map((v) => {
              return(<Option key={v} value={v} >{v}</Option>)
            })}
  </Select>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default function({
  attr,
  onClose,
  visible,
  titleColor,
  oldPredicate,
  updatePredicate,
  deletePredicate,
  propValues
}){
  // console.log('predicate ', attr, propValues)
  const [isInt, setIsInt] = useState(false);
  const [options, setOptions] = useState([]);
  const [predicate, setPredicate] = useState(JSON.parse(JSON.stringify(oldPredicate)));

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
    }
    else {
      optArr = optArr.sort();
    }
    const distinctOpts = [...new Set(optArr)];
    setOptions(distinctOpts);
    // console.log('pred', predicate)
    // console.log('isInt', isIntCpy)
  }, []);

  const handleChange = (index, label, newVal) => {
    var preds = [...predicate.preds];
    preds[index][label] = newVal;
    setPredicate({ ...predicate, preds: preds });
  };

  const addPredicate = () => {
    var preds = [...predicate.preds];
    preds.push(['0', '']);
    setPredicate({ ...predicate, preds: preds });
  };

  const removePredicate = (i) => {
    var preds = [...predicate.preds];
    preds.splice(i, 1);
    setPredicate({ ...predicate, preds: preds });
  };

  return (
    <Drawer
      title={<Title style={{marginBottom: 0}}level={3}>Attribute: <span style={{color: titleColor}}>{attr}</span></Title>}
      placement="left"
      closable={false}
      onClose={onClose}
      visible={visible}
    >
      <Divider orientation="left">Selected Predicates</Divider>
      {
        predicate.preds.map((n, i) => {
          return (
            <PredicateSelectorCard
              key={`${i}`}
              predVal={{op: n[0], value: n[1]}}
              removePredicate={removePredicate}
              handleChange={handleChange}
              options={options}
              isInt={isInt}
              index={i}/>
          )
        })
      }

    </Drawer>
  )
}
