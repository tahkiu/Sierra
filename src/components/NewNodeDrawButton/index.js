import React, { useState } from 'react';
import './index.css';
import { Drawer, Button, Collapse, Typography } from 'antd';
import { useContext } from 'react';
import { Context } from '../../Store'
import { CaretRightOutlined } from '@ant-design/icons';

const {Panel} = Collapse;
const {Title, Text} = Typography;

const NewNodeDrawButton = ({addNode}) => {
  const [visible, setVisible] = useState(false);
  const [state, dispatch] = useContext(Context)
  const {entities, props} = state
  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  return (
    <>
      <Button type="primary" onClick={showDrawer}>
        Add Node
      </Button>
      <Drawer
        closeIcon={null}
        title={<Title style={{marginBottom: 0}}level={3} >Add A New Node</Title>}
        placement="left"
        onClose={onClose}
        visible={visible}
      >

        {entities.length ? (
          <Collapse
            bordered={false}
            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
            className="site-collapse-custom-collapse"
          >
            {
            entities.map((node, i) => {
              return (
                <Panel
                  header={(<Title style={{marginBottom: 0}}level={5} >{node}</Title>)}
                  key={`${i}`}
                  class
                  extra={
                    <div onClick={e => e.stopPropagation()}>
                      <Button
                        size="small"
                        onClick={
                          () => {
                            addNode(node)
                            onClose()
                            }}>
                        Add
                      </Button>
                    </div>}
                  >
                  {<ul className='a'>
                    {props[node].map((p, i) => {
                      return (
                      <li>
                        <Text>{p}</Text>
                      </li>)
                    })}
                  </ul>}
                </Panel>
              )
            }) }
          </Collapse>

        ) : <div/> }
      </Drawer>
    </>
  );
  }

export default NewNodeDrawButton
