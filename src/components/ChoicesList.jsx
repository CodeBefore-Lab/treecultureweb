import React from "react";
import { List, Card, Typography } from "antd";

const { Title, Text } = Typography;

function ChoicesList({ mainTitles }) {
  return (
    <List
      grid={{ gutter: 16, column: 1 }}
      dataSource={mainTitles}
      renderItem={(mainTitle) => (
        <List.Item>
          <Card title={<Title level={4}>{mainTitle.mainTitleName}</Title>} className="w-full">
            <List
              dataSource={mainTitle.groupTitles}
              renderItem={(groupTitle) => (
                <List.Item>
                  <Card type="inner" title={<Title level={5}>{groupTitle.groupTitleName}</Title>}>
                    <List
                      dataSource={groupTitle.choices}
                      renderItem={(choice) => (
                        <List.Item>
                          <Text>{choice.choiceName}</Text>
                        </List.Item>
                      )}
                    />
                  </Card>
                </List.Item>
              )}
            />
          </Card>
        </List.Item>
      )}
    />
  );
}

export default ChoicesList;
